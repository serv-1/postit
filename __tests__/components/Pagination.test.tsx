import Pagination from '../../components/Pagination'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('nothing render if there is no pages', () => {
  render(
    <Pagination totalPages={0} currentPage={1} setCurrentPage={() => null} />
  )

  const navigation = screen.queryByRole('navigation')
  expect(navigation).not.toBeInTheDocument()
})

test('everything render correctly', () => {
  render(
    <Pagination totalPages={20} currentPage={10} setCurrentPage={() => null} />
  )

  const firstPage = screen.getByRole('link', { name: /first/i })
  expect(firstPage).toBeInTheDocument()

  const previousPage = screen.getByRole('link', { name: /previous/i })
  expect(previousPage).toBeInTheDocument()

  for (let i = 8; i < 13; i++) {
    const regex = new RegExp('page ' + i, 'i')
    const page = screen.getByRole('link', { name: regex })

    if (i === 10) {
      expect(page.parentElement).toHaveClass('active')
      expect(page.parentElement).toHaveAttribute('aria-current', 'page')
      expect(page.parentElement).toHaveStyle({ 'z-index': 0 })
    } else {
      expect(page).not.toHaveClass('active')
      expect(page).not.toHaveAttribute('aria-current')
    }
  }

  const nextPage = screen.getByRole('link', { name: /next/i })
  expect(nextPage).toBeInTheDocument()

  const lastPage = screen.getByRole('link', { name: /last/i })
  expect(lastPage).toBeInTheDocument()
})

test('"first page" link do not render if the current page is lesser than 4', () => {
  const { rerender } = render(
    <Pagination totalPages={20} currentPage={1} setCurrentPage={() => null} />
  )

  let firstPage = screen.queryByRole('link', { name: /first/i })
  expect(firstPage).not.toBeInTheDocument()

  rerender(
    <Pagination totalPages={20} currentPage={2} setCurrentPage={() => null} />
  )

  firstPage = screen.queryByRole('link', { name: /first/i })
  expect(firstPage).not.toBeInTheDocument()

  rerender(
    <Pagination totalPages={20} currentPage={3} setCurrentPage={() => null} />
  )

  firstPage = screen.queryByRole('link', { name: /first/i })
  expect(firstPage).not.toBeInTheDocument()
})

test('"last page" link do not render if the current page is greater than or equal to the third to last page', () => {
  const { rerender } = render(
    <Pagination totalPages={20} currentPage={18} setCurrentPage={() => null} />
  )

  let lastPage = screen.queryByRole('link', { name: /last/i })
  expect(lastPage).not.toBeInTheDocument()

  rerender(
    <Pagination totalPages={20} currentPage={19} setCurrentPage={() => null} />
  )

  lastPage = screen.queryByRole('link', { name: /last/i })
  expect(lastPage).not.toBeInTheDocument()

  rerender(
    <Pagination totalPages={20} currentPage={20} setCurrentPage={() => null} />
  )

  lastPage = screen.queryByRole('link', { name: /last/i })
  expect(lastPage).not.toBeInTheDocument()
})

test('"previous page" link do not render if the current page is the first page', () => {
  render(
    <Pagination totalPages={20} currentPage={1} setCurrentPage={() => null} />
  )

  const previousPage = screen.queryByRole('link', { name: /previous/i })
  expect(previousPage).not.toBeInTheDocument()
})

test('"next page" link do not render if the current page is the last page', () => {
  render(
    <Pagination totalPages={20} currentPage={20} setCurrentPage={() => null} />
  )

  const nextPage = screen.queryByRole('link', { name: /next/i })
  expect(nextPage).not.toBeInTheDocument()
})

test('there is no additional pages if the current page is lesser than 3', () => {
  const { rerender } = render(
    <Pagination totalPages={20} currentPage={1} setCurrentPage={() => null} />
  )

  const pageMinus1 = screen.queryByRole('link', { name: /-1/i })
  expect(pageMinus1).not.toBeInTheDocument()

  let page0 = screen.queryByRole('link', { name: /0/i })
  expect(page0).not.toBeInTheDocument()

  rerender(
    <Pagination totalPages={20} currentPage={2} setCurrentPage={() => null} />
  )

  page0 = screen.queryByRole('link', { name: /0/i })
  expect(page0).not.toBeInTheDocument()
})

test('there is no additional pages if the current page is greater than the third to last page', () => {
  const { rerender } = render(
    <Pagination totalPages={20} currentPage={19} setCurrentPage={() => null} />
  )

  let page21 = screen.queryByRole('link', { name: /21/i })
  expect(page21).not.toBeInTheDocument()

  rerender(
    <Pagination totalPages={20} currentPage={20} setCurrentPage={() => null} />
  )

  page21 = screen.queryByRole('link', { name: /21/i })
  expect(page21).not.toBeInTheDocument()

  const page22 = screen.queryByRole('link', { name: /22/i })
  expect(page22).not.toBeInTheDocument()
})

test('every links update the current page on click', () => {
  const setCurrentPage = jest.fn()

  render(
    <Pagination
      totalPages={20}
      currentPage={10}
      setCurrentPage={setCurrentPage}
    />
  )

  const links = screen.getAllByRole('link')

  let nbOfCalls = 1
  let pageNb = 8

  for (const link of links) {
    userEvent.click(link)

    const ariaLabel = link.getAttribute('aria-label') as string

    expect(setCurrentPage).toHaveBeenCalledTimes(nbOfCalls)
    nbOfCalls++

    if (/first/i.test(ariaLabel)) {
      expect(setCurrentPage).toHaveBeenCalledWith(1)
    } else if (/previous/i.test(ariaLabel)) {
      expect(setCurrentPage).toHaveBeenCalledWith(9)
    } else if (/next/i.test(ariaLabel)) {
      expect(setCurrentPage).toHaveBeenCalledWith(11)
    } else if (/last/i.test(ariaLabel)) {
      expect(setCurrentPage).toHaveBeenCalledWith(20)
    } else {
      expect(setCurrentPage).toHaveBeenCalledWith(pageNb)
      pageNb++
    }
  }
})
