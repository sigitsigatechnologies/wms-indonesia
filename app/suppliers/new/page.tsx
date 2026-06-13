'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewSupplierPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create supplier')
      }

      router.push('/suppliers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E8EAED',
    padding: '1.5rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #E8EAED',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: '#FFFFFF',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '0.375rem',
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#202124', fontSize: '1.5rem', fontWeight: '600' }}>{t('addSupplier')}</h2>
        <Link href="/suppliers" style={{ color: 'rgba(32, 33, 36, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>
          {t('back')}
        </Link>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '8px', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>{t('supplierNameLabel')}</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>{t('phoneLabel')}</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>{t('addressLabel')}</label>
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
              backgroundColor: '#1A73E8',
              color: 'white',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '700',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? t('saving') : t('save')}
          </button>
          <Link
            href="/suppliers"
            style={{
              flex: 1,
              backgroundColor: 'rgba(32, 33, 36, 0.1)',
              color: '#202124',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            {t('cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
