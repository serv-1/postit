'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PaginationLink from 'components/PaginationLink'
import PaginationActivePageNumber from 'components/PaginationActivePageNumber'
import PaginationPageLink from 'components/PaginationPageLink'

interface PaginationProps {
  totalPages: number
}

export default function Pagination({ totalPages }: PaginationProps) {
  const [activePage, setActivePage] = useState(1)
  const searchParams = useSearchParams()

  useEffect(() => {
    const page = searchParams.get('page')

    if (page) {
      setActivePage(+page)
    }
  }, [setActivePage, searchParams])

  return (
    <nav aria-label="Pages" className="flex gap-x-8 justify-center mt-16">
      {activePage > 3 && (
        <PaginationLink page={1} ariaLabel="First page">
          &lt;&lt;
        </PaginationLink>
      )}
      {activePage > 1 && (
        <PaginationLink page={activePage - 1} ariaLabel="Previous page">
          &lt;
        </PaginationLink>
      )}
      {activePage > 2 && <PaginationPageLink page={activePage - 2} />}
      {activePage > 1 && <PaginationPageLink page={activePage - 1} />}
      {<PaginationActivePageNumber page={activePage} />}
      {activePage < totalPages && <PaginationPageLink page={activePage + 1} />}
      {activePage < totalPages - 1 && (
        <PaginationPageLink page={activePage + 2} />
      )}
      {activePage < totalPages && (
        <PaginationLink page={activePage + 1} ariaLabel="Next page">
          &gt;
        </PaginationLink>
      )}
      {activePage < totalPages - 2 && (
        <PaginationLink page={totalPages} ariaLabel="Last page">
          &gt;&gt;
        </PaginationLink>
      )}
    </nav>
  )
}
