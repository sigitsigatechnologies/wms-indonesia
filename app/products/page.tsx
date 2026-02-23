'use client'

import { useEffect, useState } from 'react'
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
  isActive: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [search])

  async function fetchProducts() {
    try {
      const url = search 
        ? `/api/products?search=${encodeURIComponent(search)}`
        : '/api/products'
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #f1f5f9',
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

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
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

  const badgeStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '500',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Products</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/products/new" style={buttonStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.25rem', verticalAlign: 'middle' }}>add</span>
            New Product
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchInputStyle}
      />

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={thStyle}>BARCODE</th>
              <th style={thStyle}>NAME</th>
              <th style={thStyle}>PRICE</th>
              <th style={thStyle}>COST</th>
              <th style={thStyle}>STOCK</th>
              <th style={thStyle}>MIN</th>
              <th style={thStyle}>STATUS</th>
              <th style={{...thStyle, textAlign: 'right'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{...tdStyle, fontFamily: 'monospace', color: '#64748b'}}>{product.barcode}</td>
                <td style={{...tdStyle, fontWeight: 500}}>{product.name}</td>
                <td style={tdStyle}>Rp {Number(product.sellingPrice).toLocaleString('id-ID')}</td>
                <td style={tdStyle}>Rp {Number(product.averageCost).toLocaleString('id-ID')}</td>
                <td style={tdStyle}>
                  <span style={{
                    ...badgeStyle,
                    backgroundColor: Number(product.currentStock) <= Number(product.minStock) ? '#fef3c7' : '#eff6ff',
                    color: Number(product.currentStock) <= Number(product.minStock) ? '#b45309' : '#1d4ed8'
                  }}>
                    {product.currentStock} {product.unit}
                  </span>
                </td>
                <td style={tdStyle}>{product.minStock}</td>
                <td style={tdStyle}>
                  <span style={{
                    ...badgeStyle,
                    backgroundColor: product.isActive ? '#dcfce7' : '#f1f5f9',
                    color: product.isActive ? '#16a34a' : '#64748b'
                  }}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{...tdStyle, textAlign: 'right'}}>
                  <Link href={`/products/${product.id}`} style={{ color: '#3b82f6', textDecoration: 'none', marginRight: '0.75rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                  </Link>
                  <button onClick={() => deleteProduct(product.id)} style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>inventory_2</span>
          <p>No products found</p>
        </div>
      )}
    </div>
  )
}
