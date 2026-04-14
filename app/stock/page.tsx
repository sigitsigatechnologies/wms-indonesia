'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Pagination from '@/components/Pagination'
import { TableShimmer } from '@/components/Shimmer'
import { useLanguage } from '@/contexts/LanguageContext'

interface Product {
  id: string
  barcode: string
  name: string
  unit: string
  sellingPrice: string
  averageCost: string
  currentStock: string
  minStock: string
}

interface StockMovement {
  id: string
  productId: string
  referenceType: string
  referenceId: string
  movementType: string
  quantity: number
  stockBefore: number
  stockAfter: number
  createdAt: string
  product?: Product
}

interface PaginationInfo {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

function StockContent() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  useEffect(() => {
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const type = activeTab === 0 ? 'products' : 'movements'
    fetchData(parseInt(page), parseInt(limit), type)
  }, [activeTab, searchParams, sortBy, sortOrder])

  async function fetchData(page: number, limit: number, type: string) {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('type', type)
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      
      const res = await fetch(`/api/stock?${params.toString()}`)
      const result = await res.json()
      
      if (result.data) {
        if (type === 'products') {
          setProducts(result.data)
        } else {
          setMovements(result.data)
        }
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: number) => {
    setActiveTab(tab)
    setSortBy('createdAt')
    setSortOrder('desc')
    setPagination({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    })
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

  const thStyle: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: '600',
    borderBottom: '2px solid #f1f5f9',
    whiteSpace: 'nowrap' as const,
    color: '#64748b',
    fontSize: '0.8rem',
    cursor: 'pointer',
    userSelect: 'none',
  }

  const tdStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap' as const,
    color: '#1e293b',
    fontSize: '0.9rem',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: 'rgba(245, 158, 11, 0.1)', 
          color: '#f59e0b', 
          padding: '0.5rem', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>inventory</span>
        </div>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{t('stockManagement')}</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '0.4rem', borderRadius: '12px', width: 'fit-content' }}>
        <button 
          onClick={() => handleTabChange(0)}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: '600',
            background: activeTab === 0 ? '#f59e0b' : 'transparent',
            color: activeTab === 0 ? 'white' : '#64748b',
            border: 'none',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 0 ? '0 4px 6px -1px rgba(245, 158, 11, 0.2)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', marginRight: '0.4rem' }}>inventory_2</span>
          {t('currentStock')}
        </button>
        <button 
          onClick={() => handleTabChange(1)}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: '600',
            background: activeTab === 1 ? '#f59e0b' : 'transparent',
            color: activeTab === 1 ? 'white' : '#64748b',
            border: 'none',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 1 ? '0 4px 6px -1px rgba(245, 158, 11, 0.2)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', marginRight: '0.4rem' }}>swap_horiz</span>
          {t('movements')}
        </button>
      </div>

      {activeTab === 0 && (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={thStyle} onClick={() => handleSort('barcode')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('barcode').toUpperCase()} {getSortIcon('barcode')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('name').toUpperCase()} {getSortIcon('name')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('averageCost')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('cost').toUpperCase()} {getSortIcon('averageCost')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('sellingPrice')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('price').toUpperCase()} {getSortIcon('sellingPrice')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('currentStock')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('stockLevel').toUpperCase()} {getSortIcon('currentStock')}
                      </div>
                    </th>
                    <th style={{...thStyle, cursor: 'default'}}>{t('minStock').toUpperCase()}</th>
                    <th style={{...thStyle, cursor: 'default'}}>{t('status').toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableShimmer rows={5} />
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{...tdStyle, textAlign: 'center', color: '#94a3b8'}}>{t('noProductsFound')}</td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const currentStock = Number(product.currentStock)
                      const minStock = Number(product.minStock)
                      const isLow = currentStock <= minStock
                      const isEmpty = currentStock === 0

                      return (
                        <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td data-label="Barcode" style={{...tdStyle, fontFamily: 'monospace', color: '#64748b'}}>{product.barcode}</td>
                          <td data-label="Product" style={{...tdStyle, fontWeight: 500}}>{product.name}</td>
                          <td data-label="Cost" style={tdStyle}>Rp {Number(product.averageCost).toLocaleString('id-ID')}</td>
                          <td data-label="Price" style={tdStyle}>Rp {Number(product.sellingPrice).toLocaleString('id-ID')}</td>
                          <td data-label="Stock" style={tdStyle}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              backgroundColor: isEmpty ? '#f1f5f9' : isLow ? '#fef3c7' : '#eff6ff',
                              color: isEmpty ? '#64748b' : isLow ? '#b45309' : '#1d4ed8'
                            }}>
                              {product.currentStock} {product.unit}
                            </span>
                          </td>
                          <td data-label="Min Stock" style={tdStyle}>{product.minStock}</td>
                          <td data-label="Status" style={tdStyle}>
                            <span style={{ 
                              color: isEmpty ? '#64748b' : isLow ? '#dc2626' : '#10b981',
                              fontWeight: 500,
                              fontSize: '0.8rem'
                            }}>
                              {isEmpty ? t('outOfStock') : isLow ? t('lowStock') : t('inStock')}
                            </span>
                          </td>
                        </tr>
                      )
                    })
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
        </>
      )}

      {activeTab === 1 && (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={thStyle} onClick={() => handleSort('createdAt')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('date').toUpperCase()} {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('movementType')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('type').toUpperCase()} {getSortIcon('movementType')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('referenceType')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('reference').toUpperCase()} {getSortIcon('referenceType')}
                      </div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('quantity')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {t('qty').toUpperCase()} {getSortIcon('quantity')}
                      </div>
                    </th>
                    <th style={{...thStyle, cursor: 'default'}}>{t('before').toUpperCase()}</th>
                    <th style={{...thStyle, cursor: 'default'}}>{t('after').toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableShimmer rows={5} />
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{...tdStyle, textAlign: 'center', color: '#94a3b8'}}>{t('noMovementsFound')}</td>
                    </tr>
                  ) : (
                    movements.map((movement) => (
                      <tr key={movement.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td data-label="Date" style={tdStyle}>{new Date(movement.createdAt).toLocaleString('id-ID')}</td>
                        <td data-label="Type" style={tdStyle}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            backgroundColor: movement.movementType === 'IN' ? '#dcfce7' : '#fee2e2',
                            color: movement.movementType === 'IN' ? '#16a34a' : '#dc2626'
                          }}>
                            {movement.movementType === 'IN' ? t('stockIn') : t('stockOut')}
                          </span>
                        </td>
                        <td data-label="Reference" style={tdStyle}>{movement.referenceType}</td>
                        <td data-label="Quantity" style={tdStyle}>{movement.quantity}</td>
                        <td data-label="Before" style={tdStyle}>{movement.stockBefore}</td>
                        <td data-label="After" style={tdStyle}>{movement.stockAfter}</td>
                      </tr>
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
        </>
      )}
    </div>
  )
}

export default function StockPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <StockContent />
    </Suspense>
  )
}
