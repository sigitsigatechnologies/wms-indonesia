'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage 
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', e.target.value)
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  // Calculate showing text
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '1rem',
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#F7F9FC',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #1A2B4C',
    }}>
      {/* Items per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#475569', fontSize: '0.875rem' }}>Show:</span>
          <select
            aria-label="Items per page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid #1A2B4C',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#1A2B4C',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '600',
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span style={{ color: '#475569', fontSize: '0.875rem' }}>entries</span>
        </div>
        
        <span style={{ color: '#475569', fontSize: '0.875rem' }}>
          Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems} entries
        </span>
      </div>

      {/* Pagination buttons */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #1A2B4C',
              borderRadius: '6px',
              backgroundColor: currentPage === 1 ? 'rgba(26, 43, 76, 0.05)' : 'white',
              color: currentPage === 1 ? 'rgba(26, 43, 76, 0.3)' : '#1A2B4C',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
            Prev
          </button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #1A2B4C',
                  borderRadius: '6px',
                  backgroundColor: page === currentPage ? '#1A2B4C' : 'white',
                  color: page === currentPage ? 'white' : '#1A2B4C',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                }}
              >
                {page}
              </button>
            ) : (
              <span key={index} style={{ padding: '0.5rem', color: 'rgba(26, 43, 76, 0.4)' }}>...</span>
            )
          ))}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #1A2B4C',
              borderRadius: '6px',
              backgroundColor: currentPage === totalPages ? 'rgba(26, 43, 76, 0.05)' : 'white',
              color: currentPage === totalPages ? 'rgba(26, 43, 76, 0.3)' : '#1A2B4C',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            Next
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
