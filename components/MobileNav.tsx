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
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: 'dashboard', color: '#1A73E8' },
  { key: 'products', label: 'Products', href: '/products', icon: 'inventory_2', color: '#1A73E8' },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: 'local_shipping', color: '#1A73E8' },
  { key: 'purchases', label: 'Purchases', href: '/purchases', icon: 'shopping_cart', color: '#1A73E8' },
  { key: 'sales', label: 'Sales', href: '/sales', icon: 'payments', color: '#1A73E8' },
  { key: 'stock', label: 'Stock', href: '/stock', icon: 'assessment', color: '#1A73E8' },
  { key: 'checkPrice', label: 'Check Price', href: '/products/check-price', icon: 'price_check', color: '#1A73E8' },
  { key: 'reports', label: 'Reports', href: '/reports', icon: 'analytics', color: '#1A73E8' },
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
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#202124' }}>
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#1A73E8' }}>
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
                      backgroundColor: isActive ? '#E8F0FE' : 'transparent',
                      color: isActive ? '#1A73E8' : '#5F6368',
                    }}
                  >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: isActive ? '#1A73E8' : '#5F6368' }}>{item.icon}</span>
                  {t(item.key) || item.label}
                </Link>
              )
            })}
            
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E8EAED', marginTop: '1rem', width: '100%', backgroundColor: '#F8F9FA' }}>
              <button
                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                  backgroundColor: language === 'en' ? '#E8F0FE' : 'transparent',
                  color: language === 'en' ? '#1A73E8' : '#5F6368'
                }}
              >
                EN
              </button>
              <div style={{ width: '1px', backgroundColor: '#E8EAED' }} />
              <button
                onClick={() => { setLanguage('id'); setIsOpen(false); }}
                style={{
                  flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                  backgroundColor: language === 'id' ? '#E8F0FE' : 'transparent',
                  color: language === 'id' ? '#1A73E8' : '#5F6368'
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
