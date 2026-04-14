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
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: 'dashboard', color: '#3b82f6' },
  { key: 'products', label: 'Products', href: '/products', icon: 'inventory_2', color: '#6366f1' },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: 'local_shipping', color: '#ec4899' },
  { key: 'purchases', label: 'Purchases', href: '/purchases', icon: 'shopping_cart', color: '#8b5cf6' },
  { key: 'sales', label: 'Sales', href: '/sales', icon: 'payments', color: '#10b981' },
  { key: 'stock', label: 'Stock', href: '/stock', icon: 'assessment', color: '#f59e0b' },
  { key: 'checkPrice', label: 'Check Price', href: '/products/check-price', icon: 'price_check', color: '#6366f1' },
  { key: 'reports', label: 'Reports', href: '/reports', icon: 'analytics', color: '#06b6d4' },
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
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#1f2937' }}>
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                    color: isActive ? 'white' : '#9ca3af',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  {t(item.key) || item.label}
                </Link>
              )
            })}
            
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #374151', marginTop: '1rem', width: '100%' }}>
              <button
                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                  backgroundColor: language === 'en' ? '#374151' : 'transparent',
                  color: language === 'en' ? '#60a5fa' : '#9ca3af'
                }}
              >
                EN
              </button>
              <div style={{ width: '1px', backgroundColor: '#374151' }} />
              <button
                onClick={() => { setLanguage('id'); setIsOpen(false); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                  backgroundColor: language === 'id' ? '#374151' : 'transparent',
                  color: language === 'id' ? '#60a5fa' : '#9ca3af'
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
