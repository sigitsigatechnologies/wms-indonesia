'use client'

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

export default function Sidebar() {
  const pathname = usePathname()

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
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                color: isActive ? 'white' : '#64748b',
              }}
            >
              <span className="material-symbols-outlined" style={{ ...iconStyle, color: isActive ? 'white' : '#94a3b8' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={footerStyle}>
        <p style={footerTextStyle}>v1.0.0</p>
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
