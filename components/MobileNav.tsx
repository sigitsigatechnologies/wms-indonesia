'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Products', href: '/products', icon: 'inventory_2' },
  { label: 'Suppliers', href: '/suppliers', icon: 'local_shipping' },
  { label: 'Purchases', href: '/purchases', icon: 'shopping_cart' },
  { label: 'Sales', href: '/sales', icon: 'payments' },
  { label: 'Stock', href: '/stock', icon: 'assessment' },
  { label: 'Check Price', href: '/products/check-price', icon: 'price_check' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
                    backgroundColor: isActive ? '#7c3aed' : 'transparent',
                    color: isActive ? 'white' : '#9ca3af',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
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
