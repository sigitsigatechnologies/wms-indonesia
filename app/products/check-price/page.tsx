'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Html5Qrcode } from 'html5-qrcode'

interface Product {
  id: string
  barcode: string
  name: string
  unit: string
  sellingPrice: string
  averageCost: string
  currentStock: string
}

export default function CheckPricePage() {
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  // Auto-search when barcode is set from scanner
  useEffect(() => {
    if (isScanning && barcode.trim()) {
      setIsScanning(false)
      doSearch(barcode.trim())
    }
  }, [barcode, isScanning])

  async function doSearch(searchTerm: string) {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    setError('')
    setProduct(null)
    
    try {
      console.log('Searching for barcode:', searchTerm)
      
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(searchTerm.trim())}`)
      const data = await res.json()
      
      console.log('API Response:', data)
      
      if (data && data.length > 0) {
        setProduct(data[0])
      } else {
        setError('Product not found')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Error searching product')
    } finally {
      setLoading(false)
    }
  }

  function handleManualSearch() {
    doSearch(barcode)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      doSearch(barcode)
    }
  }

  // Scanner functions
  const startScanner = async () => {
    setScanning(true)
    setError('')
    
    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true })
      
      const scannerId = 'price-scanner'
      scannerRef.current = new Html5Qrcode(scannerId)
      
      const config = { 
        fps: 10,
        qrbox: { width: 300, height: 200 },
        aspectRatio: 1.5,
      }

      const cameras = await Html5Qrcode.getCameras()
      if (cameras && cameras.length > 0) {
        // Try to get back camera first
        const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear') || c.label.toLowerCase().includes('environment'))
        const cameraId = backCamera ? backCamera.id : cameras[0].id
        
        await scannerRef.current.start(
          cameraId,
          config,
          (decodedText: string) => {
            setBarcode(decodedText)
            setIsScanning(true)
            stopScanner()
          },
          (errorMessage: string) => {
            // Ignore scanning errors
          }
        )
      } else {
        setError('No camera found on this device')
        setScanning(false)
      }
    } catch (e: any) {
      console.error('Scanner error:', e)
      if (e.message && e.message.includes('Permission denied')) {
        setError('Camera permission denied. Please allow camera access.')
      } else if (e.message && e.message.includes('NotFoundError')) {
        setError('No camera found on this device')
      } else {
        setError('Unable to start camera: ' + (e.message || 'Unknown error'))
      }
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (e) {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>Check Price</h2>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back
        </Link>
      </div>

      {/* Scanner Area */}
      {scanning ? (
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <p style={{ margin: 0, color: 'white', fontSize: '0.875rem' }}>Scanning...</p>
            <button
              onClick={stopScanner}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Cancel
            </button>
          </div>
          <div id="price-scanner" style={{ borderRadius: '8px', overflow: 'hidden' }} />
        </div>
      ) : (
        <button
          onClick={startScanner}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          📷 Scan Barcode
        </button>
      )}

      {/* Manual Input */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9',
      }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.5rem' }}>
          Enter Barcode Manually
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type barcode..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            onClick={handleManualSearch}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Product Result */}
      {product && (
        <div style={{
          marginTop: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ backgroundColor: '#3b82f6', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>PRODUCT NAME</p>
            <h3 style={{ margin: '0.5rem 0 0', color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>{product.name}</h3>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>SELLING PRICE</p>
              <p style={{ margin: '0.5rem 0 0', color: '#1e293b', fontSize: '2.5rem', fontWeight: '700' }}>
                Rp {Number(product.sellingPrice).toLocaleString('id-ID')}
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>STOCK</p>
                <p style={{ margin: '0.25rem 0 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '500' }}>
                  {product.currentStock} {product.unit}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>BARCODE</p>
                <p style={{ margin: '0.25rem 0 0', color: '#1e293b', fontSize: '1rem', fontFamily: 'monospace' }}>
                  {product.barcode}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
