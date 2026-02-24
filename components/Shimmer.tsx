'use client'

interface ShimmerProps {
  className?: string
  style?: React.CSSProperties
}

export default function Shimmer({ style }: ShimmerProps) {
  return (
    <div
      className="shimmer"
      style={{
        ...style,
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
      }}
    />
  )
}

export function DashboardShimmer() {
  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #f1f5f9',
  }

  const gradientCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    borderRadius: '12px',
    color: 'white',
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Shimmer style={{ width: '150px', height: '32px', marginBottom: '1.5rem' }} />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Shimmer style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
              <Shimmer style={{ width: '80px', height: '16px' }} />
            </div>
            <Shimmer style={{ width: '100px', height: '32px' }} />
          </div>
        ))}
      </div>

      {/* Revenue & Profit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Shimmer style={{ ...gradientCardStyle, height: '80px' }} />
        <Shimmer style={{ ...gradientCardStyle, height: '80px' }} />
      </div>

      {/* Chart */}
      <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
        <Shimmer style={{ width: '200px', height: '24px', marginBottom: '1rem' }} />
        <Shimmer style={{ width: '100%', height: '300px' }} />
      </div>
    </div>
  )
}

export function TableShimmer({ rows = 5 }: { rows?: number }) {
  const shimmerRows = Array.from({ length: rows })
  
  return (
    <>
      {shimmerRows.map((_, index) => (
        <tr key={index}>
          <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
            <Shimmer style={{ width: '100px', height: '16px' }} />
          </td>
          <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
            <Shimmer style={{ width: '150px', height: '16px' }} />
          </td>
          <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
            <Shimmer style={{ width: '80px', height: '16px' }} />
          </td>
          <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
            <Shimmer style={{ width: '80px', height: '16px' }} />
          </td>
          <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
            <Shimmer style={{ width: '60px', height: '16px' }} />
          </td>
        </tr>
      ))}
    </>
  )
}
