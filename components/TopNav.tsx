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
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: 'dashboard', color: '#1A73E8' },
  { key: 'products', label: 'Products', href: '/products', icon: 'inventory_2', color: '#1A73E8' },
  { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: 'local_shipping', color: '#1A73E8' },
  { key: 'purchases', label: 'Purchases', href: '/purchases', icon: 'shopping_cart', color: '#1A73E8' },
  { key: 'sales', label: 'Sales', href: '/sales', icon: 'payments', color: '#1A73E8' },
  { key: 'stock', label: 'Stock', href: '/stock', icon: 'assessment', color: '#1A73E8' },
  { key: 'checkPrice', label: 'Check Price', href: '/products/check-price', icon: 'price_check', color: '#1A73E8' },
  { key: 'reports', label: 'Reports', href: '/reports', icon: 'analytics', color: '#1A73E8' },
]

const topNavStyle: React.CSSProperties = {
  height: '70px',
  width: '100%',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 100,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  borderBottom: '1px solid #E8EAED',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '1400px',
  width: '100%',
  margin: '0 auto',
  padding: '0 1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
}

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  textDecoration: 'none',
  flexShrink: 0,
}

const logoBoxStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: '#1A73E8', /* Brand Red Logo Box */
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const logoTextStyle: React.CSSProperties = {
  color: 'white',
  fontFamily: 'var(--font-noto-sans)',
  fontSize: '1rem',
  fontWeight: 'bold',
}

const logoTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#202124',
  margin: 0,
  whiteSpace: 'nowrap',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: 1,
  justifyContent: 'center',
  overflowX: 'auto',
  paddingBottom: '4px', // For scrollbar if many items
}

const navLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: '500',
  transition: 'background-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
  whiteSpace: 'nowrap',
  willChange: 'background-color, color',
}

const navTextStyle: React.CSSProperties = {
  display: 'inline',
}

const iconStyle: React.CSSProperties = {
  fontSize: '1.1rem',
}

const settingsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexShrink: 0,
}

const switcherGroupStyle: React.CSSProperties = {
  display: 'flex',
  backgroundColor: 'rgba(32, 33, 36, 0.05)',
  borderRadius: '8px',
  padding: '4px',
  border: '1px solid #E8EAED',
  gap: '4px',
}

const switcherButtonStyle: React.CSSProperties = {
  padding: '6px 12px', /* Increased for better touch target */
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
}

const langButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.7rem',
  fontWeight: '700',
  transition: 'all 0.2s ease',
}

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '24px',
  backgroundColor: '#D6E3E2',
}

export default function TopNav() {
  const pathname = usePathname()
  const { language, setLanguage, layoutType, setLayoutType, t } = useLanguage()

  return (
    <header style={topNavStyle}>
      <div style={containerStyle}>
        {/* Logo Section */}
        <Link href="/" style={logoContainerStyle}>
          <div style={logoBoxStyle}>
            <span style={logoTextStyle}>W</span>
          </div>
          <div>
            <h1 style={logoTitleStyle}>WMS Indonesia</h1>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav style={navStyle}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...navLinkStyle,
                  backgroundColor: isActive ? '#E8F0FE' : 'transparent',
                  color: isActive ? '#1A73E8' : '#5F6368',
                }}
              >
                <span className="material-symbols-outlined" style={{ ...iconStyle, color: isActive ? '#1A73E8' : '#5F6368' }}>
                  {item.icon}
                </span>
                <span style={navTextStyle}>{t(item.key) || item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Settings Section */}
        <div style={settingsStyle}>
          {/* Layout Switcher */}
          <div style={switcherGroupStyle}>
            <button
              onClick={() => setLayoutType('sidebar')}
              title={t('sidebar')}
              style={{
                ...switcherButtonStyle,
                backgroundColor: layoutType === 'sidebar' ? '#E8F0FE' : 'transparent',
                color: layoutType === 'sidebar' ? '#1A73E8' : '#5F6368'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>view_sidebar</span>
            </button>
            <button
              onClick={() => setLayoutType('topbar')}
              title={t('topbar')}
              style={{
                ...switcherButtonStyle,
                backgroundColor: layoutType === 'topbar' ? '#E8F0FE' : 'transparent',
                color: layoutType === 'topbar' ? '#1A73E8' : '#5F6368'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>tab</span>
            </button>
          </div>

          <div style={dividerStyle} />

          {/* Language Switcher */}
          <div style={switcherGroupStyle}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                ...langButtonStyle,
                backgroundColor: language === 'en' ? '#E8F0FE' : 'transparent',
                color: language === 'en' ? '#1A73E8' : '#5F6368'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('id')}
              style={{
                ...langButtonStyle,
                backgroundColor: language === 'id' ? '#E8F0FE' : 'transparent',
                color: language === 'id' ? '#1A73E8' : '#5F6368'
              }}
            >
              ID
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
