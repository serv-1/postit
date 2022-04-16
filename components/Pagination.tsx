import React, { useEffect, useState } from 'react'
import Link from './Link'

interface PaginationProps {
  totalPages: number
}

const Pagination = ({ totalPages }: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState<number>()

  useEffect(() => {
    const queryString = new URLSearchParams(window.location.search)
    const queryPage = queryString.get('page')

    setCurrentPage(queryPage ? +queryPage : 1)
  }, [setCurrentPage])

  if (!currentPage) return null

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()

    const queryString = new URLSearchParams(window.location.search)

    queryString.set('page', String(page))
    const url = '?' + queryString.toString()

    window.history.pushState({ ...window.history.state }, '', url)

    document.dispatchEvent(new CustomEvent('queryStringChange'))
    setCurrentPage(page)
  }

  const linkClass =
    'flex justify-center items-center rounded w-[28px] h-[28px] md:w-32 md:h-32 bg-fuchsia-100 hover:bg-fuchsia-300 transition-colors duration-200'

  const pagesLinks: React.ReactNode[] = []

  const start = currentPage > 2 ? currentPage - 2 : 1
  const end = currentPage < totalPages - 1 ? currentPage + 2 : totalPages

  for (let i = start; i <= end; i++) {
    pagesLinks.push(
      <li key={i} aria-current={i === currentPage ? 'page' : undefined}>
        <Link
          href="#"
          className={linkClass + (i === currentPage ? 'bg-fuchsia-300' : '')}
          aria-label={`Page ${i}`}
          onClick={(e) => onClick(e, i)}
        >
          {i}
        </Link>
      </li>
    )
  }

  return (
    <nav aria-label="Pages">
      <ol className="flex gap-x-8 justify-center mt-16">
        {currentPage > 3 && (
          <li>
            <Link
              href="#"
              className={linkClass}
              aria-label="First page"
              onClick={(e) => onClick(e, 1)}
            >
              &lt;&lt;
            </Link>
          </li>
        )}
        {currentPage > 1 && (
          <li>
            <Link
              href="#"
              className={linkClass}
              aria-label="Previous page"
              onClick={(e) => onClick(e, currentPage - 1)}
            >
              &lt;
            </Link>
          </li>
        )}
        {pagesLinks}
        {currentPage < totalPages && (
          <li>
            <Link
              href="#"
              className={linkClass}
              aria-label="Next page"
              onClick={(e) => onClick(e, currentPage + 1)}
            >
              &gt;
            </Link>
          </li>
        )}
        {currentPage < totalPages - 2 && (
          <li>
            <Link
              href="#"
              className={linkClass}
              aria-label="Last page"
              onClick={(e) => onClick(e, totalPages)}
            >
              &gt;&gt;
            </Link>
          </li>
        )}
      </ol>
    </nav>
  )
}

export default Pagination
