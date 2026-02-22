'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  barcode: string
  name: string
  unit: string
  currentStock: string
}

interface Supplier {
  id: string
  name: string
}

export default function NewPurchasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  })

  const [items, setItems] = useState<{ productId: string; quantity: number; costPrice: number }[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/suppliers'),
      ])
      const [productsData, suppliersData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json(),
      ])
      setProducts(productsData)
      setSuppliers(suppliersData)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  function addItem() {
    setItems([...items, { productId: '', quantity: 1, costPrice: 0 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.filter(item => item.productId && item.quantity > 0),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create purchase')
      }

      router.push('/purchases')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #f1f5f9',
    padding: '1.5rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: '#f8fafc',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '0.375rem',
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>New Purchase</h2>
        <Link href="/purchases" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Purchases
        </Link>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Invoice Number</label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                style={inputStyle}
                placeholder="INV-001"
              />
            </div>
            <div>
              <label style={labelStyle}>Supplier</label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Items</h3>
            <button
              type="button"
              onClick={addItem}
              style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.375rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              + Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No items added yet</p>
          ) : (
            items.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                <div>
                  <label style={{...labelStyle, fontSize: '0.75rem'}}>Product</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{...labelStyle, fontSize: '0.75rem'}}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{...labelStyle, fontSize: '0.75rem'}}>Cost</label>
                  <input
                    type="number"
                    value={item.costPrice}
                    onChange={(e) => updateItem(index, 'costPrice', Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Total</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            style={{
              flex: 1,
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: (loading || items.length === 0) ? 0.5 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create Purchase'}
          </button>
          <Link
            href="/purchases"
            style={{
              flex: 1,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
