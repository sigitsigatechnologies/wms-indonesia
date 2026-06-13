'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Html5Qrcode } from 'html5-qrcode'

interface Product {
  id: string
  barcode: string
  name: string
  unit: string
  sellingPrice: number
  currentStock: number
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [scanning, setScanning] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    paymentMethod: 'Cash',
    amountPaid: 0,
  })
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)

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

  useEffect(() => {
    fetchProducts()
    generateInvoiceNumber()
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products?limit=1000')
      const result = await res.json()
      // Handle paginated response
      const data = result.data || result
      setProducts(data.filter((p: Product) => Number(p.currentStock) > 0))
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  function generateInvoiceNumber() {
    const now = new Date()
    const invoice = `INV-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random() * 1000).toString().padStart(3,'0')}`
    setInvoiceNumber(invoice)
    setFormData(prev => ({ ...prev, invoiceNumber: invoice }))
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase().trim()
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.barcode?.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  function addToCart(product: Product) {
    const existing = cart.find(item => item.productId === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice
      }])
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId))
    } else {
      setCart(cart.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ))
    }
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const change = Math.max(0, formData.amountPaid - subtotal)

  // Scanner functions
  const startScanner = async () => {
    setScanning(true)
    setError('')
    
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      
      const scannerId = 'sale-scanner'
      scannerRef.current = new Html5Qrcode(scannerId)
      
      const config = { fps: 10, qrbox: { width: 250, height: 150 } }

      const cameras = await Html5Qrcode.getCameras()
      if (cameras && cameras.length > 0) {
        const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'))
        const cameraId = backCamera ? backCamera.id : cameras[0].id
        
        await scannerRef.current.start(
          cameraId,
          config,
          (decodedText: string) => {
            // Stop scanner and wait for it to complete before processing
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                scannerRef.current = null
                const product = products.find(p => p.barcode === decodedText.trim())
                if (product) {
                  playBeep()
                  addToCart(product)
                } else {
                  setError('Product not found')
                }
                setScanning(false)
              }).catch(() => {
                scannerRef.current = null
                const product = products.find(p => p.barcode === decodedText.trim())
                if (product) {
                  playBeep()
                  addToCart(product)
                } else {
                  setError('Product not found')
                }
                setScanning(false)
              })
            }
          },
          () => {}
        )
      } else {
        setError('No camera found')
        setScanning(false)
      }
    } catch (e: any) {
      if (e.message?.includes('Permission denied')) {
        setError('Camera permission denied')
      } else if (e.message?.includes('NotFoundError')) {
        setError('No camera found')
      } else {
        setError('Unable to start camera')
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

  async function handlePayment() {
    if (formData.amountPaid < subtotal) {
      setError('Insufficient payment')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: formData.invoiceNumber,
          paymentMethod: formData.paymentMethod,
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            sellingPrice: item.price,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create sale')
      }

      router.push('/sales')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/sales" style={{ color: '#475569', textDecoration: 'none', fontSize: '1.5rem' }}>
            ←
          </Link>
          <h2 style={{ margin: 0, color: '#202124', fontSize: '1.25rem', fontWeight: '600' }}>Point of Sale</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#475569' }}>{invoiceNumber}</span>
          <button
            onClick={startScanner}
            style={{
              backgroundColor: '#1A73E8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            📷 Scan
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      {scanning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{ backgroundColor: '#F2F2F2', borderRadius: '12px', padding: '1rem', maxWidth: '400px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Scan Barcode</h3>
              <button onClick={stopScanner} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            <div id="sale-scanner" style={{ borderRadius: '8px', overflow: 'hidden' }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Products Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #E8EAED',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          {/* Products Grid */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '0.75rem',
            alignContent: 'start',
          }}>
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8EAED',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#202124'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(32, 33, 36,0.15)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#202124'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '1', 
                  backgroundColor: 'rgba(32, 33, 36, 0.05)', 
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}>
                  📦
                </div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1A73E8' }}>
                    Rp {product.sellingPrice.toLocaleString('id-ID')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    {product.currentStock} {product.unit}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(32, 33, 36, 0.4)' }}>
              <p>No products found</p>
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <div style={{ 
          width: '380px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          border: '1px solid #E8EAED',
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Cart Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #E8EAED', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#202124' }}>Cart</h3>
              <span style={{ fontSize: '0.875rem', color: 'rgba(32, 33, 36, 0.6)' }}>{cart.length} items</span>
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(32, 33, 36, 0.4)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛒</div>
                <p>Cart is empty</p>
                <p style={{ fontSize: '0.8rem' }}>Click products to add</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  marginBottom: '0.5rem',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.productName}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                      Rp {item.price.toLocaleString('id-ID')} each
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E8EAED', backgroundColor: 'rgba(32, 33, 36, 0.05)', cursor: 'pointer', fontSize: '1rem', color: '#202124', fontWeight: '700' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E8EAED', backgroundColor: 'rgba(32, 33, 36, 0.05)', cursor: 'pointer', fontSize: '1rem', color: '#202124', fontWeight: '700' }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ minWidth: '70px', textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#202124' }}>
                      Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', backgroundColor: '#fee2e2', color: '#1A73E8', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div style={{ padding: '1rem', borderTop: '1px solid #202124', backgroundColor: '#FFFFFF', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(32, 33, 36, 0.6)', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: cart.length === 0 ? '#cbd5e1' : '#1A73E8',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                marginTop: '0.5rem',
              }}
            >
              Payment ({cart.length} items)
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{ 
            backgroundColor: '#F2F2F2', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            width: '90%', 
            maxWidth: '400px',
          }}>
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '8px', marginBottom: '1rem', color: '#EF4444', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: '600' }}>Payment</h3>
            
            <div style={{ backgroundColor: 'rgba(32, 33, 36, 0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #E8EAED' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#202124', fontWeight: '600' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1A73E8' }}>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="payment-method" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.375rem' }}>Payment Method</label>
              <select
                id="payment-method"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #E8EAED', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: 'white' }}
              >
                <option value="Cash">Cash</option>
                <option value="Debit">Debit Card</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="amount-paid" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.375rem' }}>Amount Paid</label>
              <input
                id="amount-paid"
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #E8EAED', borderRadius: '8px', fontSize: '1rem', fontWeight: '700' }}
                placeholder="0"
              />
              {formData.amountPaid > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[10000, 20000, 50000, 100000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setFormData({ ...formData, amountPaid: amount })}
                      style={{ flex: 1, padding: '0.375rem', border: '1px solid #E8EAED', borderRadius: '6px', backgroundColor: 'rgba(32, 33, 36, 0.05)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      {amount >= 1000 ? `${(amount/1000)}k` : amount}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {formData.amountPaid >= subtotal && (
              <div style={{ backgroundColor: 'rgba(32, 33, 36, 0.05)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', border: '1px solid #E8EAED' }}>
                <span style={{ color: '#202124', fontWeight: '500' }}>Change</span>
                <span style={{ color: '#1A73E8', fontWeight: '800', fontSize: '1.25rem' }}>Rp {change.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: 'rgba(32, 33, 36, 0.1)', color: '#202124', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || formData.amountPaid < subtotal}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: (loading || formData.amountPaid < subtotal) ? '#cbd5e1' : '#1A73E8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: (loading || formData.amountPaid < subtotal) ? 'not-allowed' : 'pointer', 
                  fontWeight: '700' 
                }}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
