'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Shimmer, { DashboardShimmer } from '@/components/Shimmer'
import { useLanguage } from '@/contexts/LanguageContext'

// Dynamically import the chart with a custom loading state to reduce TBT
const DashboardChart = dynamic(() => import('@/components/DashboardChart'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', backgroundColor: '#F2F2F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Shimmer style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
  </div>
})

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
  const [currentBanner, setCurrentBanner] = useState(0)
  const { t } = useLanguage()

  const promoBanners = [
    { id: 1, title: '🚀 Promo Spesial WMS!', subtitle: 'Dapatkan diskon 20% untuk modul tambahan.', gradient: 'linear-gradient(135deg, #1A2B4C, #253358)', color: 'white', indicatorColor: 'white' },
    { id: 2, title: '📦 Optimalkan Stok Anda', subtitle: 'Fitur prediktif AI kini tersedia untuk member pro.', gradient: 'linear-gradient(135deg, #FF4D5A, #FF6B75)', color: 'white', indicatorColor: 'white' },
    { id: 3, title: '🔔 Pemberitahuan Sistem', subtitle: 'Jadwal maintenance rutin minggu depan. Cek selengkapnya.', gradient: 'linear-gradient(135deg, #1A2B4C, #FF4D5A)', color: 'white', indicatorColor: 'white' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promoBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
        <div style={{ padding: '2rem', backgroundColor: '#F7A1A8', borderRadius: '12px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#FF4D5A', display: 'block', marginBottom: '1rem' }}>error</span>
          <p style={{ color: '#FF4D5A', fontSize: '1.1rem', fontWeight: '500' }}>{error || 'Unable to load dashboard data'}</p>
          <p style={{ color: 'rgba(26, 43, 76, 0.6)', marginTop: '0.5rem' }}>Please check your database connection and try again.</p>
        </div>
      </div>
    )
  }

  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#F2F2F2',
    borderRadius: '12px',
    border: '1px solid #D6E3E2',
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
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1A2B4C', fontSize: '1.5rem', fontWeight: '600' }}>{t('dashboard')}</h2>

      {/* Promo Banner Slider */}
      <div className="interactive-card" style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {promoBanners.map((banner, index) => (
          <div
            key={banner.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: banner.gradient,
              color: banner.color,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease',
              transform: `translate3d(${(index - currentBanner) * 100}%, 0, 0)`,
              opacity: index === currentBanner ? 1 : 0,
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 800 }}>{banner.title}</h3>
            <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>{banner.subtitle}</p>
          </div>
        ))}
        {/* Indicators */}
        <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
          {promoBanners.map((banner, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              style={{
                width: currentBanner === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentBanner === idx 
                  ? (banner.indicatorColor || 'white') 
                  : (banner.indicatorColor ? 'rgba(26, 43, 76, 0.3)' : 'rgba(255,255,255,0.4)'),
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: 0
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(26, 43, 76, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: '#1A2B4C', fontSize: '1.25rem' }}>inventory_2</span>
            </div>
            <p style={{ margin: 0, color: 'rgba(26, 43, 76, 0.8)', fontSize: '0.8rem', fontWeight: '600' }}>{t('totalProducts')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1A2B4C' }}>{data?.totalProducts || 0}</p>
        </div>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(26, 43, 76, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: '#1A2B4C', fontSize: '1.25rem' }}>local_shipping</span>
            </div>
            <p style={{ margin: 0, color: 'rgba(26, 43, 76, 0.8)', fontSize: '0.8rem', fontWeight: '600' }}>{t('totalSuppliers')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1A2B4C' }}>{data?.totalSuppliers || 0}</p>
        </div>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(255, 77, 90, 0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: '#FF4D5A', fontSize: '1.25rem' }}>shopping_cart</span>
            </div>
            <p style={{ margin: 0, color: 'rgba(26, 43, 76, 0.8)', fontSize: '0.8rem', fontWeight: '600' }}>{t('totalPurchases')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1A2B4C' }}>{data?.totalPurchases || 0}</p>
        </div>
        <div className="interactive-card general-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(26, 43, 76, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: '#1A2B4C', fontSize: '1.25rem' }}>payments</span>
            </div>
            <p style={{ margin: 0, color: 'rgba(26, 43, 76, 0.8)', fontSize: '0.8rem', fontWeight: '600' }}>{t('totalSales')}</p>
          </div>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#1A2B4C' }}>{data?.totalSales || 0}</p>
        </div>
      </div>

      <style>{`
        .interactive-card {
          transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
          will-change: transform;
        }
        .interactive-card.revenue-card:hover, .interactive-card.profit-card:hover {
          transform: translateY(-4px) translate3d(0, 0, 0); /* Reduced from -8px */
          cursor: pointer;
        }
        .general-card {
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .general-card:hover {
          transform: translateY(-2px) translate3d(0, 0, 0); /* Reduced from -4px */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .interactive-alert {
          transition: transform 0.2s ease-out;
          will-change: transform;
        }
        .interactive-alert:hover {
          transform: translateX(2px) translate3d(0, 0, 0);
        }
        .revenue-card {
          background: #1A2B4C;
          background: linear-gradient(135deg, #1A2B4C, #253358);
          box-shadow: 0 2px 4px rgba(26, 43, 76, 0.3);
        }
        .profit-card {
          background: #FF4D5A;
          background: linear-gradient(135deg, #FF4D5A, #FF6B75);
          box-shadow: 0 2px 4px rgba(255, 77, 90, 0.3);
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
        <div className="interactive-alert" style={{ padding: '1rem', backgroundColor: '#FFF3CD', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #F4B400', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: '#92400e' }}>warning</span>
          <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>
            {t('lowStockAlert')} {data.lowStockCount} {t('productsLowStock')}
          </p>
        </div>
      )}

      {/* Main Content Grid: Chart & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Sales Chart - Dynamically Loaded */}
        {data && data.chartData && data.chartData.length > 0 && (
          <DashboardChart data={data.chartData} title={t('salesTrend')} />
        )}

        {/* Low Stock Detailed List */}
        {data && data.lowStockProducts && data.lowStockProducts.length > 0 && (
          <div className="interactive-card general-card" style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1A2B4C', fontSize: '1.1rem', fontWeight: '600' }}>{t('itemsAttention')}</h3>
              <Link href="/products" style={{ color: '#1A2B4C', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                {t('viewAllProducts')}
              </Link>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1A2B4C', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#FFFFFF', fontWeight: 700 }}>{t('product')}</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFFFFF', fontWeight: 700 }}>{t('stockLevel')}</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFFFFF', fontWeight: 700 }}>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((product) => {
                    const isOutOfStock = Number(product.currentStock) <= 0;
                    return (
                      <tr key={product.id} style={{ borderBottom: '1px solid #D6E3E2' }}>
                        <td style={{ padding: '0.75rem', color: '#1A2B4C' }}>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(26, 43, 76, 0.4)' }}>{product.barcode || '-'}</div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: isOutOfStock ? '#FF4D5A' : '#F4B400' }}>
                          {Number(product.currentStock).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: isOutOfStock ? 'rgba(255, 77, 90, 0.1)' : 'rgba(26, 43, 76, 0.1)',
                            color: isOutOfStock ? '#FF4D5A' : '#1A2B4C'
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
                <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(26, 43, 76, 0.6)', fontSize: '0.85rem' }}>
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
