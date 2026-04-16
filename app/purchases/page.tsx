'use client'

import React, { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Pagination from '@/components/Pagination'
import { TableShimmer } from '@/components/Shimmer'
import { useLanguage } from '@/contexts/LanguageContext'

interface PurchaseItem {
  id: string
  productId: string
  quantity: number
  costPrice: number
  subtotal: number
  product?: {
    name: string
    barcode: string
  }
}

interface Purchase {
  id: string
  invoiceNumber: string
  supplierId: string
  purchaseDate: string
  totalAmount: string
  items: PurchaseItem[]
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

function PurchasesContent() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  useEffect(() => {
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    fetchPurchases(parseInt(page), parseInt(limit))
  }, [searchParams, sortBy, sortOrder])

  async function fetchPurchases(page: number, limit: number) {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      
      const res = await fetch(`/api/purchases?${params.toString()}`)
      const result = await res.json()
      
      if (result.data) {
        setPurchases(result.data)
        setPagination(result.pagination)
      } else {
        // Handle legacy response (array)
        setPurchases(result)
        setPagination({
          page: 1,
          limit: 10,
          totalItems: result.length,
          totalPages: Math.ceil(result.length / 10),
        })
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <span className="material-symbols-outlined" style={{ fontSize: '1rem', opacity: 0.3 }}>unfold_more</span>
    return sortOrder === 'asc' 
      ? <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_less</span>
      : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
  }

  async function deletePurchase(id: string) {
    if (!confirm(t('deleteConfirm'))) return
    
    try {
      await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
      fetchPurchases(pagination.page, pagination.limit)
    } catch (error) {
      console.error('Error deleting purchase:', error)
    }
  }

  const toggleExpand = (id: string) => {
    if (expandedPurchaseId === id) {
      setExpandedPurchaseId(null)
    } else {
      setExpandedPurchaseId(id)
    }
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#FF4D5A',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(255, 77, 90, 0.2)',
  }

  const thStyle: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: '700',
    borderBottom: '2px solid rgba(255,255,255,0.1)',
    whiteSpace: 'nowrap' as const,
    color: '#FFFFFF',
    fontSize: '0.8rem',
    cursor: 'pointer',
    userSelect: 'none',
    letterSpacing: '0.05em',
  }

  const tdStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #1A2B4C',
    whiteSpace: 'nowrap' as const,
    color: '#1A2B4C',
    fontSize: '0.9rem',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      <div className="row" style={{ marginBottom: '2rem', alignItems: 'center' }}>
        <div className="col-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(26, 43, 76, 0.1)', 
              color: '#1A2B4C', 
              padding: '0.5rem', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>shopping_cart</span>
            </div>
            <h2 style={{ margin: 0, color: '#1A2B4C', fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{t('purchases')}</h2>
          </div>
        </div>
        <div className="col-6" style={{ textAlign: 'right' }}>
          <Link href="/purchases/new" style={buttonStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', marginRight: '0.4rem' }}>add_circle</span>
            {t('newPurchase')}
          </Link>
        </div>
      </div>

      <div style={{ backgroundColor: '#F7F9FC', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #1A2B4C' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1A2B4C' }}>
                 <th style={thStyle} onClick={() => handleSort('invoiceNumber')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {t('invoice').toUpperCase()} {getSortIcon('invoiceNumber')}
                  </div>
                </th>
                <th style={thStyle} onClick={() => handleSort('purchaseDate')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {t('date').toUpperCase()} {getSortIcon('purchaseDate')}
                  </div>
                </th>
                <th style={thStyle} onClick={() => handleSort('totalAmount')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {t('total').toUpperCase()} {getSortIcon('totalAmount')}
                  </div>
                </th>
                <th style={{...thStyle, cursor: 'default'}}>{t('items').toUpperCase()}</th>
                <th style={{...thStyle, textAlign: 'right', cursor: 'default'}}>{t('actions').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableShimmer rows={5} />
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{...tdStyle, textAlign: 'center', color: 'rgba(26, 43, 76, 0.4)'}}>{t('noPurchasesFound')}</td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <React.Fragment key={purchase.id}>
                    <tr style={{ borderBottom: expandedPurchaseId === purchase.id ? 'none' : '1px solid #1A2B4C', backgroundColor: expandedPurchaseId === purchase.id ? '#FFFFFF' : 'transparent', transition: 'background-color 0.2s' }}>
                      <td data-label="Invoice" style={{...tdStyle, fontWeight: 700, cursor: 'pointer', color: '#1A2B4C'}} onClick={() => toggleExpand(purchase.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', transition: 'transform 0.2s', transform: expandedPurchaseId === purchase.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                          {purchase.invoiceNumber}
                        </div>
                      </td>
                      <td data-label="Date" style={tdStyle}>{new Date(purchase.purchaseDate).toLocaleDateString('id-ID')}</td>
                      <td data-label="Total" style={{...tdStyle, fontWeight: 600}}>Rp {Number(purchase.totalAmount).toLocaleString('id-ID')}</td>
                      <td data-label="Items" style={tdStyle}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: 'rgba(26, 43, 76, 0.1)', color: '#1A2B4C' }}>
                          {purchase.items?.length || 0} items
                        </span>
                      </td>
                      <td data-label="Actions" style={{...tdStyle, textAlign: 'right'}}>
                        <button onClick={() => deletePurchase(purchase.id)} style={{ color: '#FF4D5A', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Purchase">
                          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                        </button>
                      </td>
                    </tr>
                    {expandedPurchaseId === purchase.id && (
                      <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #1A2B4C' }}>
                        <td colSpan={5} style={{ padding: '0 2rem 1.5rem 3rem' }}>
                          <div style={{ backgroundColor: '#F7F9FC', borderRadius: '8px', border: '1px solid #1A2B4C', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(26, 43, 76, 0.1)', borderBottom: '1px solid #1A2B4C' }}>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>{t('name')}</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>{t('barcode')}</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569', fontWeight: 600 }}>{t('qty')}</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569', fontWeight: 600 }}>{t('cost')}</th>
                                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569', fontWeight: 600 }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {purchase.items?.map((item, idx) => (
                                  <tr key={item.id || idx} style={{ borderBottom: idx === purchase.items.length - 1 ? 'none' : '1px solid #1A2B4C' }}>
                                    <td style={{ padding: '0.75rem 1rem', color: '#1A2B4C' }}>{item.product?.name || 'Unknown Product'}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'rgba(26, 43, 76, 0.6)' }}>{item.product?.barcode || '-'}</td>
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#1A2B4C', fontWeight: 500 }}>{Number(item.quantity).toLocaleString('id-ID')}</td>
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(26, 43, 76, 0.6)' }}>Rp {Number(item.costPrice).toLocaleString('id-ID')}</td>
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#1A2B4C', fontWeight: 500 }}>Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                                  </tr>
                                ))}
                                {(!purchase.items || purchase.items.length === 0) && (
                                  <tr>
                                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'rgba(26, 43, 76, 0.4)' }}>No items found for this purchase</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.limit}
      />

      {purchases.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(26, 43, 76, 0.4)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>shopping_cart</span>
          <p>No purchases found</p>
        </div>
      )}
    </div>
  )
}

export default function PurchasesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <PurchasesContent />
    </Suspense>
  )
}
