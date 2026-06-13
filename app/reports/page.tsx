'use client'

import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useLanguage } from '@/contexts/LanguageContext'

interface TopProduct {
  name: string
  barcode: string
  totalQuantity: number
  totalRevenue: number
}

interface ReportSummary {
  totalPurchasesAmount: number
  purchaseCount: number
  totalSalesAmount: number
  totalProfit: number
  saleCount: number
  totalStockIn: number
  totalStockOut: number
  netProfit: number
}

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    fetchReport()
  }, [month, year])

  async function fetchReport() {
    try {
      setLoading(true)
      const res = await fetch(`/api/reports/monthly?month=${month}&year=${year}`)
      const data = await res.json()
      setSummary(data.summary)
      setTopProducts(data.topProducts || [])
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!summary) return

    const doc = new jsPDF()
    const monthsId = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const title = `WMS Indonesia - Laporan Bulanan`
    const period = `${monthsId[month]} ${year}`

    doc.setFontSize(22)
    doc.setTextColor(30, 41, 59) // slate-800
    doc.text(title, 14, 22)
    
    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.text(`Periode: ${period}`, 14, 30)
    doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 36)

    // 1. Financial Summary Table
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('1. Ringkasan Keuangan', 14, 48)

    const financialData = [
      ['Total Pendapatan Penjualan', `Rp ${summary.totalSalesAmount.toLocaleString('id-ID')}`],
      ['Total Keuntungan Penjualan', `Rp ${summary.totalProfit.toLocaleString('id-ID')}`],
      ['Total Pengeluaran Pembelian', `Rp ${summary.totalPurchasesAmount.toLocaleString('id-ID')}`],
      ['Laba Bersih (Langsung)', `Rp ${summary.netProfit.toLocaleString('id-ID')}`],
    ]

    autoTable(doc, {
      startY: 52,
      head: [['Kategori', 'Jumlah']],
      body: financialData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
    })

    // 2. Inventory Summary Table
    const finalY1 = (doc as any).lastAutoTable.finalY
    doc.text('2. Ringkasan Inventaris', 14, finalY1 + 15)

    const inventoryData = [
      ['Total Stok Masuk (Unit)', summary.totalStockIn.toString()],
      ['Total Stok Keluar (Unit)', summary.totalStockOut.toString()],
      ['Total Transaksi', (summary.saleCount + summary.purchaseCount).toString()],
    ]

    autoTable(doc, {
      startY: finalY1 + 19,
      head: [['Metrik Inventaris', 'Nilai']],
      body: inventoryData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
    })

    // 3. Top Products Table
    if (topProducts.length > 0) {
      const finalY2 = (doc as any).lastAutoTable.finalY
      doc.text('3. Produk Penjualan Terbanyak', 14, finalY2 + 15)

      const topProductsData = topProducts.map(p => [
        p.name,
        p.barcode,
        p.totalQuantity.toString(),
        `Rp ${p.totalRevenue.toLocaleString('id-ID')}`
      ])

      autoTable(doc, {
        startY: finalY2 + 19,
        head: [['Nama Produk', 'Barcode', 'Jumlah Terjual', 'Pendapatan']],
        body: topProductsData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }, // brand red
      })
    }

    doc.save(`Laporan_WMS_${monthsId[month]}_${year}.pdf`)
  }

  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E8EAED',
    height: '100%',
  }

  const labelStyle: React.CSSProperties = {
    color: 'rgba(32, 33, 36, 0.6)',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    display: 'block',
  }

  const valueStyle: React.CSSProperties = {
    color: '#202124',
    fontSize: '1.5rem',
    fontWeight: '700',
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
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>analytics</span>
            </div>
            <h2 style={{ margin: 0, color: '#202124', fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{t('monthlyReports')}</h2>
          </div>
        </div>
        <div className="col-6" style={{ textAlign: 'right' }}>
          <button 
            onClick={downloadPDF} 
            disabled={!summary || loading}
            style={{ 
              backgroundColor: '#1A73E8',
              color: 'white', 
              padding: '0.6rem 1.25rem', 
              borderRadius: '12px', 
              border: 'none', 
              cursor: ( !summary || loading ) ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: ( !summary || loading ) ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(26, 115, 232, 0.2)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>picture_as_pdf</span>
            {t('exportPDF')}
          </button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '2rem', gap: '1rem' }}>
        <div className="col-6">
          <select 
            aria-label="Select Month"
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E8EAED', width: '100%', outline: 'none', backgroundColor: 'white', color: '#202124', fontWeight: '600' }}
          >
            {months.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        </div>
        <div className="col-6">
          <select 
            aria-label="Select Year"
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #E8EAED', width: '100%', outline: 'none', backgroundColor: 'white', color: '#202124', fontWeight: '600' }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>{t('loadingReport')}</div>
      ) : summary ? (
        <div className="row">
          <div className="col-12 col-md-4" style={{ marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <span style={labelStyle}>{t('totalSalesLabel')}</span>
              <div style={valueStyle}>Rp {summary.totalSalesAmount.toLocaleString('id-ID')}</div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#202124' }}>{summary.saleCount} {t('transactions')}</p>
            </div>
          </div>
          <div className="col-12 col-md-4" style={{ marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <span style={labelStyle}>{t('totalPurchasesLabel')}</span>
              <div style={valueStyle}>Rp {summary.totalPurchasesAmount.toLocaleString('id-ID')}</div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#1A73E8' }}>{summary.purchaseCount} {t('transactions')}</p>
            </div>
          </div>
          <div className="col-12 col-md-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #202124 0%, #253358 100%)', border: 'none' }}>
              <span style={{ ...labelStyle, color: 'rgba(255,255,255,0.8)' }}>{t('netProfit')}</span>
              <div style={{ ...valueStyle, color: 'white' }}>Rp {summary.netProfit.toLocaleString('id-ID')}</div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{t('basedOnSales')}</p>
            </div>
          </div>

          <div className="col-6" style={{ marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#202124' }}>arrow_downward</span>
                <span style={{ fontWeight: '600', color: '#202124' }}>{t('stockIn')}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#202124' }}>{summary.totalStockIn}</div>
              <span style={{ color: 'rgba(32, 33, 36, 0.6)', fontSize: '0.875rem' }}>{t('unitsReceived')}</span>
            </div>
          </div>
          <div className="col-6" style={{ marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#1A73E8' }}>arrow_upward</span>
                <span style={{ fontWeight: '600', color: '#202124' }}>{t('stockOut')}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#202124' }}>{summary.totalStockOut}</div>
              <span style={{ color: 'rgba(32, 33, 36, 0.6)', fontSize: '0.875rem' }}>{t('unitsDispatched')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(32, 33, 36, 0.4)' }}>{t('noDataAvailable')}</div>
      )}

      {topProducts.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#202124', marginBottom: '1rem' }}>{t('topSellingProducts')}</h3>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F9FA' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#3C4043', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '700' }}>{t('name').toUpperCase()}</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#3C4043', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '700' }}>{t('qtySold').toUpperCase()}</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#3C4043', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '700' }}>{t('revenue').toUpperCase()}</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} style={{ borderBottom: i === topProducts.length - 1 ? 'none' : '1px solid #202124' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#202124' }}>
                      <div style={{ fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(32, 33, 36, 0.6)' }}>{p.barcode}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', color: '#202124' }}>{p.totalQuantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', color: '#202124', fontWeight: '600' }}>Rp {p.totalRevenue.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
