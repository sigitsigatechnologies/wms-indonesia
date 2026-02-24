'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Pagination from '@/components/Pagination'
import { TableShimmer } from '@/components/Shimmer'

interface SaleItem {
  id: string
  productId: string
  quantity: number
  sellingPrice: number
  profit: number
  subtotal: number
}

interface Sale {
  id: string
  invoiceNumber: string
  totalAmount: string
  totalProfit: string
  paymentMethod: string
  items: SaleItem[]
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
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
    fetchSales(parseInt(page), parseInt(limit))
  }, [searchParams])

  async function fetchSales(page: number, limit: number) {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      
      const res = await fetch(`/api/sales?${params.toString()}`)
      const result = await res.json()
      
      if (result.data) {
        setSales(result.data)
        setPagination(result.pagination)
      } else {
        // Handle legacy response (array)
        setSales(result)
        setPagination({
          page: 1,
          limit: 10,
          totalItems: result.length,
          totalPages: Math.ceil(result.length / 10),
        })
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const totalProfit = sales.reduce((sum, s) => sum + Number(s.totalProfit || 0), 0)

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Sales</h2>
        <Link href="/sales/new" style={buttonStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.25rem', verticalAlign: 'middle' }}>add</span>
          New Sale
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)', borderRadius: '12px', color: 'white' }}>
          <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.8rem', fontWeight: '500' }}>Total Revenue</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', borderRadius: '12px', color: 'white' }}>
          <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.8rem', fontWeight: '500' }}>Total Profit</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Rp {totalProfit.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={thStyle}>INVOICE</th>
              <th style={thStyle}>TOTAL</th>
              <th style={thStyle}>PROFIT</th>
              <th style={thStyle}>PAYMENT</th>
              <th style={thStyle}>ITEMS</th>
              <th style={thStyle}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableShimmer rows={5} />
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} style={{...tdStyle, textAlign: 'center', color: '#94a3b8'}}>No sales found</td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{...tdStyle, fontWeight: 500}}>{sale.invoiceNumber}</td>
                  <td style={tdStyle}>Rp {Number(sale.totalAmount).toLocaleString('id-ID')}</td>
                  <td style={{...tdStyle, color: '#10b981', fontWeight: 500}}>Rp {Number(sale.totalProfit).toLocaleString('id-ID')}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td style={tdStyle}>{sale.items?.length || 0} items</td>
                  <td style={tdStyle}>{new Date(sale.createdAt).toLocaleDateString('id-ID')}</td>
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

      {sales.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>payments</span>
          <p>No sales found</p>
        </div>
      )}
    </div>
  )
}

export default function SalesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>}>
      <SalesContent />
    </Suspense>
  )
}
