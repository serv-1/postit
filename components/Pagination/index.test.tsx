import Pagination from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const setPage = (page: number) => {
  const q = '?query=cat&page=' + page
  Object.defineProperty(window, 'location', { get: () => ({ search: q }) })
}

const setPushState = () => {
  const pushState = jest.fn()
  Object.defineProperty(window, 'history', { get: () => ({ pushState }) })
  return pushState
}

const setOnQueryStringChange = () => {
  const onQueryStringChange = jest.fn()
  document.addEventListener('queryStringChange', onQueryStringChange)
  return onQueryStringChange
}

const removeOnQueryStringChange = (onQueryStringChange: EventListener) => {
  document.removeEventListener('queryStringChange', onQueryStringChange)
}

it('renders', () => {
  setPage(10)
  render(<Pagination totalPages={20} />)

  const firstPage = screen.getByRole('link', { name: /first/i })
  expect(firstPage).toBeInTheDocument()

  const previousPage = screen.getByRole('link', { name: /previous/i })
  expect(previousPage).toBeInTheDocument()

  for (let i = 8; i < 13; i++) {
    const regex = new RegExp('page ' + i, 'i')
    const page = screen.getByRole('link', { name: regex })

    if (i === 10) {
      expect(page.parentElement).toHaveAttribute('aria-current', 'page')
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

test('the first page link links to the first page', async () => {
  const pushState = setPushState()
  const onQueryStringChange = setOnQueryStringChange()

  setPage(10)
  render(<Pagination totalPages={20} />)

  const firstPageLink = screen.getByRole('link', { name: /first/i })
  await userEvent.click(firstPageLink)

  expect(pushState).toHaveBeenNthCalledWith(1, {}, '', '?query=cat&page=1')
  expect(onQueryStringChange).toHaveBeenCalledTimes(1)

  removeOnQueryStringChange(onQueryStringChange)
})

test("the first page link doesn't render if it's already visible", () => {
  setPage(1)
  const { rerender } = render(<Pagination totalPages={20} />)

  let firstPage = screen.queryByRole('link', { name: /first/i })
  expect(firstPage).not.toBeInTheDocument()

  setPage(2)
  rerender(<Pagination totalPages={20} />)

  firstPage = screen.queryByRole('link', { name: /first/i })
  expect(firstPage).not.toBeInTheDocument()

  setPage(3)
  rerender(<Pagination totalPages={20} />)

  firstPage = screen.queryByRole('link', { name: /first/i })
  expect(firstPage).not.toBeInTheDocument()
})

test('the last page link links to the last page', async () => {
  const pushState = setPushState()
  const onQueryStringChange = setOnQueryStringChange()

  setPage(10)
  render(<Pagination totalPages={20} />)

  const lastPageLink = screen.getByRole('link', { name: /last/i })
  await userEvent.click(lastPageLink)

  expect(pushState).toHaveBeenNthCalledWith(1, {}, '', '?query=cat&page=20')
  expect(onQueryStringChange).toHaveBeenCalledTimes(1)

  removeOnQueryStringChange(onQueryStringChange)
})

test("the last page link doesn't render if it's already visible", () => {
  setPage(18)
  const { rerender } = render(<Pagination totalPages={20} />)

  let lastPage = screen.queryByRole('link', { name: /last/i })
  expect(lastPage).not.toBeInTheDocument()

  setPage(19)
  rerender(<Pagination totalPages={20} />)

  lastPage = screen.queryByRole('link', { name: /last/i })
  expect(lastPage).not.toBeInTheDocument()

  setPage(20)
  rerender(<Pagination totalPages={20} />)

  lastPage = screen.queryByRole('link', { name: /last/i })
  expect(lastPage).not.toBeInTheDocument()
})

test('the previous page link links to the previous page', async () => {
  const pushState = setPushState()
  const onQueryStringChange = setOnQueryStringChange()

  setPage(10)
  render(<Pagination totalPages={20} />)

  const previousPageLink = screen.getByRole('link', { name: /previous/i })
  await userEvent.click(previousPageLink)

  expect(pushState).toHaveBeenNthCalledWith(1, {}, '', '?query=cat&page=9')
  expect(onQueryStringChange).toHaveBeenCalledTimes(1)

  removeOnQueryStringChange(onQueryStringChange)
})

test("the previous page link doesn't render if there is no previous page", () => {
  setPage(1)
  render(<Pagination totalPages={20} />)
  const previousPage = screen.queryByRole('link', { name: /previous/i })
  expect(previousPage).not.toBeInTheDocument()
})

test('the next page link links to the next page', async () => {
  const pushState = setPushState()
  const onQueryStringChange = setOnQueryStringChange()

  setPage(10)
  render(<Pagination totalPages={20} />)

  const nextPageLink = screen.getByRole('link', { name: /next/i })
  await userEvent.click(nextPageLink)

  expect(pushState).toHaveBeenNthCalledWith(1, {}, '', '?query=cat&page=11')
  expect(onQueryStringChange).toHaveBeenCalledTimes(1)

  removeOnQueryStringChange(onQueryStringChange)
})

test("the next page link doesn't render if there is no next page", () => {
  setPage(20)
  render(<Pagination totalPages={20} />)
  const nextPage = screen.queryByRole('link', { name: /next/i })
  expect(nextPage).not.toBeInTheDocument()
})

test('there is no additional pages with the first and second page', () => {
  setPage(1)
  const { rerender } = render(<Pagination totalPages={20} />)

  const pageMinus1 = screen.queryByRole('link', { name: /-1/i })
  expect(pageMinus1).not.toBeInTheDocument()

  let page0 = screen.queryByRole('link', { name: /0/i })
  expect(page0).not.toBeInTheDocument()

  setPage(2)
  rerender(<Pagination totalPages={20} />)

  page0 = screen.queryByRole('link', { name: /0/i })
  expect(page0).not.toBeInTheDocument()
})

test('there is no additional pages with the last and second to last page', () => {
  setPage(19)
  const { rerender } = render(<Pagination totalPages={20} />)

  let page21 = screen.queryByRole('link', { name: /21/i })
  expect(page21).not.toBeInTheDocument()

  setPage(20)
  rerender(<Pagination totalPages={20} />)

  page21 = screen.queryByRole('link', { name: /21/i })
  expect(page21).not.toBeInTheDocument()

  const page22 = screen.queryByRole('link', { name: /22/i })
  expect(page22).not.toBeInTheDocument()
})

test('a numbered page sends to the matching numbered page', async () => {
  const pushState = setPushState()
  const onQueryStringChange = setOnQueryStringChange()

  setPage(10)
  render(<Pagination totalPages={20} />)

  const page12Link = screen.getByRole('link', { name: /12/i })
  await userEvent.click(page12Link)

  expect(pushState).toHaveBeenNthCalledWith(1, {}, '', '?query=cat&page=12')
  expect(onQueryStringChange).toHaveBeenCalledTimes(1)

  removeOnQueryStringChange(onQueryStringChange)
})
