'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    async function fetchSupplier() {
      try {
        const res = await fetch(`/api/suppliers/${id}`)
        if (!res.ok) throw new Error('Supplier not found')
        const data = await res.json()
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setFetching(false)
      }
    }
    fetchSupplier()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update supplier')
      }

      router.push('/suppliers')
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
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Edit Supplier</h2>
        <Link href="/suppliers" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Suppliers
        </Link>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Supplier Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
          />
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
            {loading ? 'Updating...' : 'Update Supplier'}
          </button>
          <Link
            href="/suppliers"
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
