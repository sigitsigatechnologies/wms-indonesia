'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DashboardShimmer } from '@/components/Shimmer'
import { useLanguage } from '@/contexts/LanguageContext'

interface ChartData {
  date: string
  label: string
  revenue: number
  profit: number
}

interface LowStockProduct {
  id: string
  name: string
  barcode: string
  currentStock: number
  minStock: number
}

interface DashboardData {
  totalProducts: number
  totalSuppliers: number
  totalPurchases: number
  totalSales: number
  totalRevenue: number
  totalProfit: number
  lowStockCount: number
  lowStockProducts: LowStockProduct[]
  chartData: ChartData[]
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch from optimized dashboard API - single request instead of 4!
        const res = await fetch('/api/dashboard')
        const dashboardData = await res.json()
        
        // Check if API returned an error
        if (dashboardData.error) {
          console.error('API Error:', dashboardData.error)
          setError(dashboardData.error)
          setData(null)
        } else {
          setData(dashboardData)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <DashboardShimmer />
  }

  // Show error message if there's an error
  if (error || !data) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ padding: '2rem', backgroundColor: '#fef2f2', borderRadius: '12px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#dc2626', display: 'block', marginBottom: '1rem' }}>error</span>
          <p style={{ color: '#dc2626', fontSize: '1.1rem', fontWeight: '500' }}>{error || 'Unable to load dashboard data'}</p>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Please check your database connection and try again.</p>
        </div>
      </div>
    )
  }

  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
  }

  const gradientCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    borderRadius: '12px',
    color: 'white',
  }

  const buttonStyle: React.CSSProperties = {
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>{t('dashboard')}</h2>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
              <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '1.25rem' }}>inventory_2</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>{t('totalProducts')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalProducts || 0}</p>
        </div>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fdf4ff' }}>
              <span className="material-symbols-outlined" style={{ color: '#d946ef', fontSize: '1.25rem' }}>local_shipping</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>{t('totalSuppliers')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalSuppliers || 0}</p>
        </div>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fffbeb' }}>
              <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '1.25rem' }}>shopping_cart</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>{t('totalPurchases')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalPurchases || 0}</p>
        </div>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#d1fae5' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '1.25rem' }}>payments</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>{t('totalSales')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalSales || 0}</p>
        </div>
      </div>

      <style>{`
        .interactive-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .interactive-card.revenue-card:hover, .interactive-card.profit-card:hover {
          transform: translateY(-8px) scale(1.02);
          cursor: pointer;
        }
        .general-card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.08); /* default box-shadow */
        }
        .general-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .interactive-alert {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .interactive-alert:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06);
        }
        .revenue-card {
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
        }
        .revenue-card:hover {
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.2) !important;
        }
        .profit-card {
          background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%);
          box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.5);
        }
        .profit-card:hover {
          box-shadow: 0 20px 25px -5px rgba(168, 85, 247, 0.4), 0 10px 10px -5px rgba(168, 85, 247, 0.2) !important;
        }
      `}</style>
      
      {/* Revenue & Profit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
        <div className="interactive-card revenue-card" style={{ ...gradientCardStyle, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', opacity: 1, color: 'white' }}>account_balance</span>
            </div>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalRevenue')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data?.totalRevenue || 0)}
          </p>
        </div>
        <div className="interactive-card profit-card" style={{ ...gradientCardStyle, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', opacity: 1, color: 'white' }}>trending_up</span>
            </div>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalProfit')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data?.totalProfit || 0)}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {data && data.lowStockCount > 0 && (
        <div className="interactive-alert" style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#92400e' }}>warning</span>
          <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>
            {t('lowStockAlert')} {data.lowStockCount} {t('productsLowStock')}
          </p>
        </div>
      )}

      {/* Main Content Grid: Chart & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Sales Chart */}
        {data && data.chartData && data.chartData.length > 0 && (
          <div className="interactive-card general-card" style={{ ...cardStyle }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>{t('salesTrend')}</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                    labelStyle={{ color: '#1e293b' }}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Low Stock Detailed List */}
        {data && data.lowStockProducts && data.lowStockProducts.length > 0 && (
          <div className="interactive-card general-card" style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>{t('itemsAttention')}</h3>
              <Link href="/products" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                {t('viewAllProducts')}
              </Link>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{t('product')}</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{t('stockLevel')}</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((product) => {
                    const isOutOfStock = Number(product.currentStock) <= 0;
                    return (
                      <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', color: '#1e293b' }}>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{product.barcode || '-'}</div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: isOutOfStock ? '#ef4444' : '#f59e0b' }}>
                          {Number(product.currentStock).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: isOutOfStock ? '#fef2f2' : '#fffbeb',
                            color: isOutOfStock ? '#ef4444' : '#f59e0b'
                          }}>
                            {isOutOfStock ? t('outOfStock') : t('lowStock')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {data.lowStockCount > 15 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                  + {data.lowStockCount - 15} {t('moreLowStock')}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
