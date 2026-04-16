'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface NavItem {
  key: string
  label: string
  href: string
  icon: string
  color: string
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: 'dashboard', color: '#FF4D5A' },
  { key: 'products', label: 'Products', href: '/products', icon: 'inventory_2', color: '#FF4D5A' },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: 'local_shipping', color: '#FF4D5A' },
  { key: 'purchases', label: 'Purchases', href: '/purchases', icon: 'shopping_cart', color: '#FF4D5A' },
  { key: 'sales', label: 'Sales', href: '/sales', icon: 'payments', color: '#FF4D5A' },
  { key: 'stock', label: 'Stock', href: '/stock', icon: 'assessment', color: '#FF4D5A' },
  { key: 'checkPrice', label: 'Check Price', href: '/products/check-price', icon: 'price_check', color: '#FF4D5A' },
  { key: 'reports', label: 'Reports', href: '/reports', icon: 'analytics', color: '#FF4D5A' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#1A2B4C' }}>
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#FF4D5A' }}>
          WMS
        </h1>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <nav style={mobileNavStyle}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      ...mobileLinkStyle,
                      backgroundColor: isActive ? item.color : 'transparent',
                      color: isActive ? 'white' : '#1A2B4C',
                    }}
                  >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  {t(item.key) || item.label}
                </Link>
              )
            })}
            
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1A2B4C', marginTop: '1rem', width: '100%', backgroundColor: 'rgba(26, 43, 76, 0.05)' }}>
              <button
                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                  backgroundColor: language === 'en' ? '#1A2B4C' : 'transparent',
                  color: language === 'en' ? 'white' : '#1A2B4C'
                }}
              >
                EN
              </button>
              <div style={{ width: '1px', backgroundColor: '#1A2B4C' }} />
              <button
                onClick={() => { setLanguage('id'); setIsOpen(false); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                  backgroundColor: language === 'id' ? '#1A2B4C' : 'transparent',
                  color: language === 'id' ? 'white' : '#1A2B4C'
                }}
              >
                ID
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

const mobileNavStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
}

const mobileLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: '500',
}
