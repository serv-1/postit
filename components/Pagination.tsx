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

  const pagesLinks: React.ReactNode[] = []

  const start = currentPage > 2 ? currentPage - 2 : 1
  const end = currentPage < totalPages - 1 ? currentPage + 2 : totalPages

  for (let i = start; i <= end; i++) {
    let ariaCurrent: 'page' | undefined = undefined
    let linkClass =
      'border border-indigo-600 rounded px-8 py-4 text-s hover:bg-indigo-600 hover:text-white'

    if (i === currentPage) {
      linkClass += ' bg-indigo-600 text-white'
      ariaCurrent = 'page'
    }

    pagesLinks.push(
      <li key={i} className="mr-4" aria-current={ariaCurrent}>
        <Link
          href="#"
          className={linkClass}
          aria-label={`Page ${i}`}
          onClick={(e) => onClick(e, i)}
        >
          {i}
        </Link>
      </li>
    )
  }

  return (
    <nav aria-label="Pages" className="col-span-full">
      <ul className="flex justify-center">
        {currentPage > 3 && (
          <li>
            <Link
              href="#"
              className="border border-indigo-600 rounded px-8 py-4 text-s mr-4 hover:bg-indigo-600 hover:text-white"
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
              className="border border-indigo-600 rounded px-8 py-4 text-s mr-4 hover:bg-indigo-600 hover:text-white"
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
              className="border border-indigo-600 rounded px-8 py-4 text-s mr-4 hover:bg-indigo-600 hover:text-white"
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
              className="border border-indigo-600 rounded px-8 py-4 text-s hover:bg-indigo-600 hover:text-white"
              aria-label="Last page"
              onClick={(e) => onClick(e, totalPages)}
            >
              &gt;&gt;
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Pagination
