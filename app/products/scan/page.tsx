'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScanBarcodePage() {
  const router = useRouter()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [cameras, setCameras] = useState<{id: string, label: string}[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const scannerId = 'barcode-scanner-container'

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (e) {
        // Ignore errors when clearing
      }
      scannerRef.current = null
    }
    setScanning(false)
  }, [])

  // Get available cameras on mount
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setCameras(devices)
          // Prefer back camera (environment) for mobile, front camera for laptop
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'))
          const frontCamera = devices.find(d => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('user'))
          setSelectedCamera(backCamera?.id || frontCamera?.id || devices[0].id)
        } else {
          setError('No cameras found on this device')
        }
      } catch (e) {
        console.error('Error getting cameras:', e)
        setError('Could not access cameras. Please allow camera permission.')
      }
    }
    getCameras()
  }, [])

  // Start scanner when camera is selected
  useEffect(() => {
    if (!selectedCamera || scanning) return

    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode(scannerId)
        
        const config = { 
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.333,
        }

        await scannerRef.current.start(
          selectedCamera,
          config,
          (decodedText: string) => {
            // Success - barcode detected
            stopScanner()
            router.push(`/products/new?barcode=${encodeURIComponent(decodedText)}`)
          },
          (errorMessage: string) => {
            // Ignore scan errors - they're expected when no barcode in view
          }
        )
        
        setScanning(true)
      } catch (e: any) {
        console.error('Scanner error:', e)
        setError(`Failed to start camera: ${e.message || 'Unknown error'}`)
      }
    }

    startScanner()

    return () => {
      stopScanner()
    }
  }, [selectedCamera, router, stopScanner, scanning])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <button 
          onClick={() => router.back()}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Back
        </button>
        <h3 style={{ margin: 0 }}>Scan Barcode</h3>
        <div style={{ width: 80 }} />
      </div>

      {/* Camera selector */}
      {cameras.length > 1 && (
        <div style={{
          position: 'absolute',
          top: '4rem',
          left: '1rem',
          right: '1rem',
          zIndex: 10,
        }}>
          <select
            value={selectedCamera}
            onChange={(e) => {
              setSelectedCamera(e.target.value)
              stopScanner()
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              fontSize: '0.9rem',
            }}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Scanner Area */}
      <div style={{ 
        width: '100%', 
        maxWidth: '500px',
        padding: '1rem',
        marginTop: cameras.length > 1 ? '2rem' : '4rem',
      }}>
        <div id={scannerId} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
      </div>
      
      {/* Instructions */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        {error ? (
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
        ) : scanning ? (
          <p style={{ color: 'white', margin: 0 }}>
            Position the barcode within the frame<br/>
            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>The scanner will detect automatically</span>
          </p>
        ) : (
          <p style={{ color: '#fbbf24', margin: 0 }}>
            Opening scanner...
          </p>
        )}
      </div>

      {/* Manual Link */}
      <button
        onClick={() => router.push('/products/new')}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 2rem',
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Skip - Enter Manually →
      </button>
    </div>
  )
}
