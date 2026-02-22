'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Supplier {
  id: string
  name: string
  phone: string
  address: string
  createdAt: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSuppliers()
  }, [search])

  async function fetchSuppliers() {
    try {
      const url = search 
        ? `/api/suppliers?search=${encodeURIComponent(search)}`
        : '/api/suppliers'
      const res = await fetch(url)
      const data = await res.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteSupplier(id: string) {
    if (!confirm('Are you sure you want to delete this supplier?')) return
    
    try {
      await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
      fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
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

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    marginBottom: '1.5rem',
    backgroundColor: '#f8fafc',
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
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Suppliers</h2>
        <Link href="/suppliers/new" style={buttonStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.25rem', verticalAlign: 'middle' }}>add</span>
          New Supplier
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search suppliers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchInputStyle}
      />

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={thStyle}>NAME</th>
              <th style={thStyle}>PHONE</th>
              <th style={thStyle}>ADDRESS</th>
              <th style={thStyle}>CREATED</th>
              <th style={{...thStyle, textAlign: 'right'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{...tdStyle, fontWeight: 500}}>{supplier.name}</td>
                <td style={tdStyle}>{supplier.phone}</td>
                <td style={tdStyle}>{supplier.address}</td>
                <td style={tdStyle}>{new Date(supplier.createdAt).toLocaleDateString('id-ID')}</td>
                <td style={{...tdStyle, textAlign: 'right'}}>
                  <Link href={`/suppliers/${supplier.id}`} style={{ color: '#3b82f6', textDecoration: 'none', marginRight: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                  </Link>
                  <button onClick={() => deleteSupplier(supplier.id)} style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {suppliers.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>local_shipping</span>
          <p>No suppliers found</p>
        </div>
      )}
    </div>
  )
}
