'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    unit: 'pcs',
    sellingPrice: '',
    averageCost: '',
    currentStock: '0',
    minStock: '0',
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        setFormData({
          barcode: data.barcode || '',
          name: data.name || '',
          unit: data.unit || 'pcs',
          sellingPrice: data.sellingPrice?.toString() || '',
          averageCost: data.averageCost?.toString() || '',
          currentStock: data.currentStock?.toString() || '0',
          minStock: data.minStock?.toString() || '0',
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setFetching(false)
      }
    }
    fetchProduct()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sellingPrice: Number(formData.sellingPrice),
          averageCost: Number(formData.averageCost),
          currentStock: Number(formData.currentStock),
          minStock: Number(formData.minStock),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update product')
      }

      router.push('/products')
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

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: '#64748b' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Edit Product</h2>
        <Link href="/products" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Products
        </Link>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Barcode</label>
          <input
            type="text"
            required
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Product Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Unit</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Selling Price</label>
            <input
              type="number"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Average Cost</label>
            <input
              type="number"
              value={formData.averageCost}
              onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Current Stock</label>
            <input
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Min Stock</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
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
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          <Link
            href="/products"
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
