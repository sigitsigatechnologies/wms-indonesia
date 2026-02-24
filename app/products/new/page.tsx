'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Barcode Scanner Component using html5-qrcode
import { Html5Qrcode } from 'html5-qrcode'

function BarcodeScanner({ onScan, onClose }: { onScan: (barcode: string) => void; onClose: () => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const scannerId = 'inline-barcode-scanner'

    const startScanner = async () => {
      if (!mounted) return
      
      try {
        // Wait for DOM
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (!mounted) return
        
        scannerRef.current = new Html5Qrcode(scannerId)
        
        const config = { 
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333,
          videoConstraints: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            facingMode: 'environment'
          }
        }

        // Get available cameras first
        const cameras = await Html5Qrcode.getCameras()
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id
          
          await scannerRef.current.start(
            cameraId,
            config,
            (decodedText: string) => {
              // Stop scanner immediately on successful scan - wait for it to complete
              if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                  scannerRef.current = null
                  onScan(decodedText)
                }).catch((e) => {
                  scannerRef.current = null
                  onScan(decodedText)
                })
              }
            },
            (errorMessage: string) => {
              // Ignore scan errors
            }
          )
        } else {
          setError('No camera found')
        }
      } catch (e: any) {
        if (mounted) {
          console.error('Scanner error:', e)
          setError(e.message || 'Failed to start scanner')
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (scannerRef.current) {
        try {
          // Check if scanner is running before stopping
          const isScanning = scannerRef.current.isScanning
          if (isScanning) {
            scannerRef.current.stop()
          }
        } catch (e) {
          // Ignore - video might already be removed from document
        }
        try {
          scannerRef.current.clear()
        } catch (e) {
          // Ignore
        }
        scannerRef.current = null
      }
    }
  }, [onScan])

  return (
    <div ref={containerRef} style={{
      padding: '1rem',
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <p style={{ margin: 0, color: 'white', fontSize: '0.875rem' }}>Scan Barcode</p>
        <button
          onClick={onClose}
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
      {error ? (
        <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
      ) : (
        <div 
          id="inline-barcode-scanner" 
          style={{ 
            width: '100%', 
            minHeight: '250px',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }} 
        />
      )}
    </div>
  )
}

// Inner component that uses useSearchParams
function NewProductForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    unit: 'pcs',
    sellingPrice: '',
    averageCost: '',
    currentStock: '0',
    minStock: '0',
  })

  // Play beep sound on successful scan
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 1800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.log('Audio not supported')
    }
  }

  // Handle barcode from URL parameter (from scan page)
  useEffect(() => {
    const barcodeParam = searchParams.get('barcode')
    if (barcodeParam) {
      setFormData(prev => ({ ...prev, barcode: barcodeParam }))
    }
  }, [searchParams])

  function handleBarcodeScan(barcode: string) {
    playBeep() // Play beep sound on successful scan
    setFormData({ ...formData, barcode })
    setShowScanner(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to create product')
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

  return (
    <>
      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner 
          onScan={handleBarcodeScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Barcode</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              required
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Scan or enter barcode"
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.875rem',
              }}
            >
              📷 Scan
            </button>
          </div>
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
            placeholder="e.g., pcs, kg, liter"
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
            {loading ? 'Creating...' : 'Create Product'}
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
    </>
  )
}

// Loading fallback
function FormLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '4rem' 
    }}>
      <p style={{ color: '#64748b' }}>Loading...</p>
    </div>
  )
}

// Main page component with Suspense boundary
export default function NewProductPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>New Product</h2>
        <Link href="/products" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Products
        </Link>
      </div>

      <Suspense fallback={<FormLoading />}>
        <NewProductForm />
      </Suspense>
    </div>
  )
}
