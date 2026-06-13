'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
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
  isActive: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
    fetchProducts(parseInt(page), parseInt(limit))
  }, [search, searchParams, sortBy, sortOrder])

  async function fetchProducts(page: number, limit: number) {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      
      const res = await fetch(`/api/products?${params.toString()}`)
      const result = await res.json()
      
      if (result.data) {
        setProducts(result.data)
        setPagination(result.pagination)
      } else {
        // Handle legacy response (array)
        setProducts(result)
        setPagination({
          page: 1,
          limit: 10,
          totalItems: result.length,
          totalPages: Math.ceil(result.length / 10),
        })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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

  async function deleteProduct(id: string) {
    if (!confirm(t('deleteConfirm'))) return
    
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      fetchProducts(pagination.page, pagination.limit)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E8EAED',
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#1A73E8',
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
    boxShadow: '0 4px 6px -1px rgba(26, 115, 232, 0.2)',
  }

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.8rem',
    border: '1px solid #E8EAED',
    borderRadius: '12px',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  }

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  }

  const thStyle: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: '700',
    borderBottom: '2px solid #E8EAED',
    whiteSpace: 'nowrap' as const,
    color: '#3C4043',
    fontSize: '0.8rem',
    cursor: 'pointer',
    userSelect: 'none',
    letterSpacing: '0.05em',
  }

  const tdStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #E8EAED',
    whiteSpace: 'nowrap' as const,
    color: '#202124',
    fontSize: '0.9rem',
  }

  const badgeStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '500',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      <div className="row" style={{ marginBottom: '2rem', alignItems: 'center' }}>
        <div className="col-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(32, 33, 36, 0.1)', 
              color: '#202124', 
              padding: '0.5rem', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>inventory_2</span>
            </div>
            <h2 style={{ margin: 0, color: '#202124', fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{t('products')}</h2>
          </div>
        </div>
        <div className="col-6" style={{ textAlign: 'right' }}>
          <Link href="/products/new" style={buttonStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', marginRight: '0.4rem' }}>add_circle</span>
            {t('newProduct')}
          </Link>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '2rem' }}>
        <div className="col-12" style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'rgba(32, 33, 36, 0.4)',
            fontSize: '1.25rem'
          }}>
            search
          </span>
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </div>

      <div className="table-container">
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="responsive-table" style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA' }}>
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
                <th style={thStyle} onClick={() => handleSort('sellingPrice')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {t('price').toUpperCase()} {getSortIcon('sellingPrice')}
                  </div>
                </th>
                <th style={thStyle}>{t('cost').toUpperCase()}</th>
                <th style={thStyle} onClick={() => handleSort('currentStock')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {t('stockLevel').toUpperCase()} {getSortIcon('currentStock')}
                  </div>
                </th>
                <th style={thStyle}>{t('minStock').toUpperCase()}</th>
                <th style={thStyle}>{t('status').toUpperCase()}</th>
                <th style={{...thStyle, textAlign: 'right', cursor: 'default'}}>{t('actions').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableShimmer rows={5} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{...tdStyle, textAlign: 'center', color: 'rgba(32, 33, 36, 0.4)'}}>{t('noProductsFound')}</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #E8EAED' }}>
                    <td data-label="Barcode" style={{...tdStyle, fontFamily: 'monospace', color: '#475569'}}>{product.barcode}</td>
                    <td data-label="Name" style={{...tdStyle, fontWeight: 500}}>{product.name}</td>
                    <td data-label="Price" style={tdStyle}>Rp {Number(product.sellingPrice).toLocaleString('id-ID')}</td>
                    <td data-label="Cost" style={tdStyle}>Rp {Number(product.averageCost).toLocaleString('id-ID')}</td>
                    <td data-label="Stock" style={tdStyle}>
                      <span style={{
                        ...badgeStyle,
                        backgroundColor: Number(product.currentStock) <= Number(product.minStock) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(32, 33, 36, 0.1)',
                        color: Number(product.currentStock) <= Number(product.minStock) ? '#1A73E8' : '#202124',
                        fontWeight: '700',
                      }}>
                        {product.currentStock} {product.unit}
                      </span>
                    </td>
                    <td data-label="Min Stock" style={tdStyle}>{product.minStock}</td>
                    <td data-label="Status" style={tdStyle}>
                      <span style={{
                        ...badgeStyle,
                        backgroundColor: product.isActive ? 'rgba(32, 33, 36, 0.1)' : 'rgba(32, 33, 36, 0.05)',
                        color: product.isActive ? '#202124' : 'rgba(32, 33, 36, 0.4)',
                        fontWeight: '700',
                      }}>
                        {product.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td data-label="Actions" style={{...tdStyle, textAlign: 'right'}}>
                      <Link href={`/products/${product.id}`} style={{ color: '#202124', textDecoration: 'none', marginRight: '0.75rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                      </Link>
                      <button onClick={() => deleteProduct(product.id)} style={{ color: '#1A73E8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                      </button>
                    </td>
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

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(32, 33, 36, 0.4)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>inventory_2</span>
        <p>{t('noProductsFound')}</p>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
