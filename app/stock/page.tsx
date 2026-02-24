'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Pagination from '@/components/Pagination'
import { TableShimmer } from '@/components/Shimmer'

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
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })
  const searchParams = useSearchParams()

  useEffect(() => {
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const type = activeTab === 0 ? 'products' : 'movements'
    fetchData(parseInt(page), parseInt(limit), type)
  }, [activeTab, searchParams])

  async function fetchData(page: number, limit: number, type: string) {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('type', type)
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      
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
    setPagination({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    })
  }

  const thStyle: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: '600',
    borderBottom: '2px solid #f1f5f9',
    whiteSpace: 'nowrap' as const,
    color: '#64748b',
    fontSize: '0.8rem',
  }

  const tdStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap' as const,
    color: '#1e293b',
    fontSize: '0.9rem',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Stock Management</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => handleTabChange(0)}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: '500',
            background: activeTab === 0 ? '#3b82f6' : 'white',
            color: activeTab === 0 ? 'white' : '#64748b',
            border: 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.25rem' }}>inventory</span>
          Current Stock
        </button>
        <button 
          onClick={() => handleTabChange(1)}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: '500',
            background: activeTab === 1 ? '#3b82f6' : 'white',
            color: activeTab === 1 ? 'white' : '#64748b',
            border: 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.25rem' }}>swap_vert</span>
          Movements
        </button>
      </div>

      {activeTab === 0 && (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={thStyle}>BARCODE</th>
                  <th style={thStyle}>PRODUCT</th>
                  <th style={thStyle}>COST</th>
                  <th style={thStyle}>PRICE</th>
                  <th style={thStyle}>STOCK</th>
                  <th style={thStyle}>MIN</th>
                  <th style={thStyle}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableShimmer rows={5} />
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{...tdStyle, textAlign: 'center', color: '#94a3b8'}}>No products found</td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const currentStock = Number(product.currentStock)
                    const minStock = Number(product.minStock)
                    const isLow = currentStock <= minStock
                    const isEmpty = currentStock === 0

                    return (
                      <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{...tdStyle, fontFamily: 'monospace', color: '#64748b'}}>{product.barcode}</td>
                        <td style={{...tdStyle, fontWeight: 500}}>{product.name}</td>
                        <td style={tdStyle}>Rp {Number(product.averageCost).toLocaleString('id-ID')}</td>
                        <td style={tdStyle}>Rp {Number(product.sellingPrice).toLocaleString('id-ID')}</td>
                        <td style={tdStyle}>
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
                        <td style={tdStyle}>{product.minStock}</td>
                        <td style={tdStyle}>
                          <span style={{ 
                            color: isEmpty ? '#64748b' : isLow ? '#dc2626' : '#10b981',
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}>
                            {isEmpty ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={thStyle}>DATE</th>
                  <th style={thStyle}>TYPE</th>
                  <th style={thStyle}>REFERENCE</th>
                  <th style={thStyle}>QTY</th>
                  <th style={thStyle}>BEFORE</th>
                  <th style={thStyle}>AFTER</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableShimmer rows={5} />
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{...tdStyle, textAlign: 'center', color: '#94a3b8'}}>No movements found</td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>{new Date(movement.createdAt).toLocaleString('id-ID')}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          backgroundColor: movement.movementType === 'IN' ? '#dcfce7' : '#fee2e2',
                          color: movement.movementType === 'IN' ? '#16a34a' : '#dc2626'
                        }}>
                          {movement.movementType === 'IN' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td style={tdStyle}>{movement.referenceType}</td>
                      <td style={tdStyle}>{movement.quantity}</td>
                      <td style={tdStyle}>{movement.stockBefore}</td>
                      <td style={tdStyle}>{movement.stockAfter}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
