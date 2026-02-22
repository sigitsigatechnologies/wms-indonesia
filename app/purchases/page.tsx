'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PurchaseItem {
  id: string
  productId: string
  quantity: number
  costPrice: number
  subtotal: number
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

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPurchases()
  }, [])

  async function fetchPurchases() {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setPurchases(data)
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deletePurchase(id: string) {
    if (!confirm('Are you sure you want to delete this purchase?')) return
    
    try {
      await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
      fetchPurchases()
    } catch (error) {
      console.error('Error deleting purchase:', error)
    }
  }

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
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Purchases</h2>
        <Link href="/purchases/new" style={buttonStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.25rem', verticalAlign: 'middle' }}>add</span>
          New Purchase
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={thStyle}>INVOICE</th>
              <th style={thStyle}>DATE</th>
              <th style={thStyle}>TOTAL</th>
              <th style={thStyle}>ITEMS</th>
              <th style={{...thStyle, textAlign: 'right'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{...tdStyle, fontWeight: 500}}>{purchase.invoiceNumber}</td>
                <td style={tdStyle}>{new Date(purchase.purchaseDate).toLocaleDateString('id-ID')}</td>
                <td style={tdStyle}>Rp {Number(purchase.totalAmount).toLocaleString('id-ID')}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    {purchase.items?.length || 0} items
                  </span>
                </td>
                <td style={{...tdStyle, textAlign: 'right'}}>
                  <button onClick={() => deletePurchase(purchase.id)} style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {purchases.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>shopping_cart</span>
          <p>No purchases found</p>
        </div>
      )}
    </div>
  )
}
