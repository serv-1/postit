import ChevronLeft from '../public/static/images/chevron-left.svg'
import ChevronRight from '../public/static/images/chevron-right.svg'
import ChevronDoubleLeft from '../public/static/images/chevron-double-left.svg'
import ChevronDoubleRight from '../public/static/images/chevron-double-right.svg'
import React from 'react'

interface liAttributes {
  className: string
  'aria-current'?: 'page'
  style?: React.CSSProperties
}

interface PaginationProps {
  totalPages: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  currentPage: number
}

const Pagination = ({
  totalPages,
  setCurrentPage,
  currentPage,
}: PaginationProps) => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  const pagesLinks: React.ReactNode[] = []

  const start = currentPage > 2 ? currentPage - 2 : 1
  const end = currentPage < totalPages - 1 ? currentPage + 2 : totalPages

  for (let i = start; i <= end; i++) {
    const attr: liAttributes = {
      className: 'page-item',
    }

    if (i === currentPage) {
      attr.className += ' active'
      attr['aria-current'] = 'page'
      attr.style = { zIndex: 0 }
    }

    pagesLinks.push(
      <li key={i} {...attr}>
        <a
          href="#"
          className="page-link"
          aria-label={`Page ${i}`}
          onClick={(e) => onClick(e, i)}
        >
          {i}
        </a>
      </li>
    )
  }

  return totalPages > 0 ? (
    <nav aria-label="Pages">
      <ul className="pagination justify-content-center m-0">
        {currentPage > 3 && (
          <li className="page-item">
            <a
              href="#"
              className="page-link"
              aria-label="First page"
              onClick={(e) => onClick(e, 1)}
            >
              <ChevronDoubleLeft />
            </a>
          </li>
        )}
        {currentPage > 1 && (
          <li className="page-item">
            <a
              href="#"
              className="page-link"
              aria-label="Previous page"
              onClick={(e) => onClick(e, currentPage - 1)}
            >
              <ChevronLeft />
            </a>
          </li>
        )}
        {pagesLinks}
        {currentPage < totalPages && (
          <li className="page-item">
            <a
              href="#"
              className="page-link"
              aria-label="Next page"
              onClick={(e) => onClick(e, currentPage + 1)}
            >
              <ChevronRight />
            </a>
          </li>
        )}
        {currentPage < totalPages - 2 && (
          <li className="page-item">
            <a
              href="#"
              className="page-link"
              aria-label="Last page"
              onClick={(e) => onClick(e, totalPages)}
            >
              <ChevronDoubleRight />
            </a>
          </li>
        )}
      </ul>
    </nav>
  ) : null
}

export default Pagination
