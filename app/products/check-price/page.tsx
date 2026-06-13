'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Html5Qrcode } from 'html5-qrcode'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScannedRef = useRef<string>('')
  const { t } = useLanguage()

  // Play beep sound when barcode is scanned
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

  // Auto-search when barcode changes
  useEffect(() => {
    if (barcode.trim() && barcode !== lastScannedRef.current) {
      lastScannedRef.current = barcode
      doSearch(barcode.trim())
    }
  }, [barcode])

  async function doSearch(searchTerm: string) {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    setError('')
    setProduct(null)
    
    try {
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(searchTerm.trim())}`)
      const data = await res.json()
      
      // Handle both array response (barcode search) and paginated response
      const products = Array.isArray(data) ? data : (data.data || [])
      
      if (products && products.length > 0) {
        setProduct(products[0])
      } else {
        setError(t('productNotFound'))
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Error searching product')
    } finally {
      setLoading(false)
    }
  }

  function handleManualSearch() {
    lastScannedRef.current = barcode
    doSearch(barcode)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      lastScannedRef.current = barcode
      doSearch(barcode)
    }
  }

  // Scanner functions
  const startScanner = async () => {
    setScanning(true)
    setError('')
    setProduct(null)
    
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
          async (decodedText: string) => {
            playBeep()
            
            // Stop scanner immediately
            if (scannerRef.current) {
              try {
                await scannerRef.current.stop()
                scannerRef.current.clear()
              } catch (e) {
                // Ignore errors when stopping
              }
              scannerRef.current = null
            }
            
            setScanning(false)
            // Set barcode - useEffect will trigger search automatically
            setBarcode(decodedText)
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
        <h2 style={{ margin: 0, color: '#202124', fontSize: '1.5rem', fontWeight: '600' }}>{t('checkPrice')}</h2>
        <Link href="/" style={{ color: 'rgba(32, 33, 36, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>
          {t('back')}
        </Link>
      </div>

      {/* Scanner Area */}
      {scanning ? (
        <div style={{
          backgroundColor: '#1A73E8',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <p style={{ margin: 0, color: 'white', fontSize: '0.875rem' }}>{t('scanning')}</p>
            <button
              onClick={stopScanner}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#1A73E8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              {t('cancel')}
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
            backgroundColor: '#1A73E8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {t('scanBarcode')}
        </button>
      )}

      {/* Manual Input */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E8EAED',
      }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.5rem' }}>
          {t('enterBarcodeManually')}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeBarcode')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #E8EAED',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            onClick={handleManualSearch}
            disabled={loading || !barcode.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading || !barcode.trim() ? '#cbd5e1' : '#202124',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !barcode.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '700',
            }}
          >
            {loading ? '...' : t('searchBtn')}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(32, 33, 36, 0.1)', borderRadius: '8px', textAlign: 'center', color: '#202124', fontWeight: '600' }}>
          {t('searching')}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '8px', color: '#1A73E8', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Product Result */}
      {product && (
        <div style={{
          marginTop: '1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #E8EAED'
        }}>
          <div style={{ backgroundColor: '#1A73E8', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{t('productName_label')}</p>
            <h3 style={{ margin: '0.5rem 0 0', color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>{product.name}</h3>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, color: 'rgba(32, 33, 36, 0.6)', fontSize: '0.875rem' }}>{t('sellingPrice_label')}</p>
              <p style={{ margin: '0.5rem 0 0', color: '#1A73E8', fontSize: '2.5rem', fontWeight: '800' }}>
                Rp {Number(product.sellingPrice).toLocaleString('id-ID')}
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #202124', paddingTop: '1rem' }}>
              <div>
                <p style={{ margin: 0, color: 'rgba(32, 33, 36, 0.6)', fontSize: '0.75rem' }}>{t('stockLevel').toUpperCase()}</p>
                <p style={{ margin: '0.25rem 0 0', color: '#202124', fontSize: '1.1rem', fontWeight: '700' }}>
                  {product.currentStock} {product.unit}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: 'rgba(32, 33, 36, 0.6)', fontSize: '0.75rem' }}>{t('barcode').toUpperCase()}</p>
                <p style={{ margin: '0.25rem 0 0', color: '#202124', fontSize: '1rem', fontFamily: 'monospace', fontWeight: '600' }}>
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
