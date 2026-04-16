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
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: 'dashboard', color: 'var(--color-red)' },
  { key: 'products', label: 'Products', href: '/products', icon: 'inventory_2', color: 'var(--color-red)' },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: 'local_shipping', color: 'var(--color-red)' },
  { key: 'purchases', label: 'Purchases', href: '/purchases', icon: 'shopping_cart', color: 'var(--color-red)' },
  { key: 'sales', label: 'Sales', href: '/sales', icon: 'payments', color: 'var(--color-red)' },
  { key: 'stock', label: 'Stock', href: '/stock', icon: 'assessment', color: 'var(--color-red)' },
  { key: 'checkPrice', label: 'Check Price', href: '/products/check-price', icon: 'price_check', color: 'var(--color-red)' },
  { key: 'reports', label: 'Reports', href: '/reports', icon: 'analytics', color: 'var(--color-red)' },
]

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  minHeight: '100vh',
  backgroundColor: '#1A2B4C', /* Navy background */
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem 1rem',
  position: 'fixed',
  left: 0,
  top: 0,
  boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
  borderRight: '1px solid rgba(255,255,255,0.1)',
  zIndex: 10,
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
  background: '#FF4D5A', /* Red Logo Box */
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
  color: '#FFFFFF', /* White Logo Title */
  margin: 0,
  lineHeight: 1.2,
}

const logoSubtitleStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'rgba(255, 255, 255, 0.6)', /* Lightened subtitle */
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
  padding: '0.85rem 1rem', /* Increased for better touch target */
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'background-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
  willChange: 'background-color, color',
}

const iconStyle: React.CSSProperties = {
  fontSize: '1.25rem',
}

const footerStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderTop: '1px solid rgba(255,255,255,0.1)',
}

const footerTextStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#cbd5e1',
  margin: 0,
  textAlign: 'center',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { language, setLanguage, layoutType, setLayoutType, t } = useLanguage()

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
                backgroundColor: isActive ? 'var(--color-red)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
              }}
            >
              <span className="material-symbols-outlined" style={{ ...iconStyle, color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}>
                {item.icon}
              </span>
              {t(item.key) || item.label}
            </Link>
          )
        })}
      </nav>
      <div style={footerStyle}>
        {/* Layout Switcher */}
        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.75rem', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setLayoutType('sidebar')}
            style={{
              flex: 1, padding: '0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
              backgroundColor: layoutType === 'sidebar' ? 'var(--color-red)' : 'transparent',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>side_navigation</span>
            {t('sidebar')}
          </button>
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <button
            onClick={() => setLayoutType('topbar')}
            style={{
              flex: 1, padding: '0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
              backgroundColor: layoutType === 'topbar' ? 'var(--color-red)' : 'transparent',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>tab</span>
            {t('topbar')}
          </button>
        </div>

        {/* Language Switcher */}
        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              flex: 1, padding: '0.65rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: language === 'en' ? 'var(--color-red)' : 'transparent',
              color: 'white'
            }}
          >
            EN
          </button>
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <button
            onClick={() => setLanguage('id')}
            style={{
              flex: 1, padding: '0.65rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: language === 'id' ? 'var(--color-red)' : 'transparent',
              color: 'white'
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
