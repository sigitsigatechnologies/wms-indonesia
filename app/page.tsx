'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData {
  date: string
  label: string
  revenue: number
  profit: number
}

interface DashboardData {
  totalProducts: number
  totalSuppliers: number
  totalPurchases: number
  totalSales: number
  totalRevenue: number
  totalProfit: number
  lowStockCount: number
  chartData: ChartData[]
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch from optimized dashboard API - single request instead of 4!
        const res = await fetch('/api/dashboard')
        const dashboardData = await res.json()
        
        setData(dashboardData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Dashboard</h2>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
              <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '1.25rem' }}>inventory_2</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Total Products</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalProducts || 0}</p>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fdf4ff' }}>
              <span className="material-symbols-outlined" style={{ color: '#d946ef', fontSize: '1.25rem' }}>local_shipping</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Total Suppliers</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalSuppliers || 0}</p>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fffbeb' }}>
              <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '1.25rem' }}>shopping_cart</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Total Purchases</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalPurchases || 0}</p>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
              <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '1.25rem' }}>payments</span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Total Sales</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{data?.totalSales || 0}</p>
        </div>
      </div>

      {/* Revenue & Profit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...gradientCardStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', opacity: 0.9 }}>account_balance</span>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.8rem', fontWeight: '500' }}>Total Revenue</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Rp {data?.totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div style={{ ...gradientCardStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', opacity: 0.9 }}>trending_up</span>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.8rem', fontWeight: '500' }}>Total Profit</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Rp {data?.totalProfit.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {data && data.lowStockCount > 0 && (
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#92400e' }}>warning</span>
          <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>
            Low Stock Alert: {data.lowStockCount} products are running low on stock!
          </p>
        </div>
      )}

      {/* Sales Chart */}
      {data && data.chartData && data.chartData.length > 0 && (
        <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>Sales Trend (Last 7 Days)</h3>
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
    </div>
  )
}
