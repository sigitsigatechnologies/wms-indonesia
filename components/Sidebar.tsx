'use client'

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

export default function Sidebar() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  return (
    <aside style={sidebarStyle}>
      <div style={logoContainerStyle}>
        <div style={logoBoxStyle}>
          <span style={logoTextStyle}>W</span>
        </div>
        <div>
          <h1 style={logoTitleStyle}>WMS</h1>
          <p style={logoSubtitleStyle}>Indonesia</p>
        </div>
      </div>

      <nav style={navStyle}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...navLinkStyle,
                backgroundColor: isActive ? item.color : 'transparent',
                color: isActive ? 'white' : '#64748b',
              }}
            >
              <span className="material-symbols-outlined" style={{ ...iconStyle, color: isActive ? 'white' : '#94a3b8' }}>
                {item.icon}
              </span>
              {t(item.key) || item.label}
            </Link>
          )
        })}
      </nav>

      <div style={footerStyle}>
        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1rem', width: '100%' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              flex: 1, padding: '0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: language === 'en' ? '#f1f5f9' : 'transparent',
              color: language === 'en' ? '#3b82f6' : '#64748b'
            }}
          >
            EN
          </button>
          <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
          <button
            onClick={() => setLanguage('id')}
            style={{
              flex: 1, padding: '0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: language === 'id' ? '#f1f5f9' : 'transparent',
              color: language === 'id' ? '#3b82f6' : '#64748b'
            }}
          >
            ID
          </button>
        </div>
        <p style={{ ...footerTextStyle, marginBottom: '0' }}>v1.0.0</p>
      </div>
    </aside>
  )
}

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem 1rem',
  position: 'fixed',
  left: 0,
  top: 0,
  boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
  borderRight: '1px solid #f1f5f9',
}

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0 0.75rem',
  marginBottom: '2rem',
}

const logoBoxStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const logoTextStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '1.25rem',
  fontWeight: 'bold',
}

const logoTitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: 0,
  lineHeight: 1.2,
}

const logoSubtitleStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#94a3b8',
  margin: 0,
  letterSpacing: '0.1em',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: 1,
}

const navLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'all 0.2s ease',
}

const iconStyle: React.CSSProperties = {
  fontSize: '1.25rem',
}

const footerStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderTop: '1px solid #f1f5f9',
}

const footerTextStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#cbd5e1',
  margin: 0,
  textAlign: 'center',
}
