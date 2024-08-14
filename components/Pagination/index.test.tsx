import Pagination from '.'
import { render, screen } from '@testing-library/react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  ReadonlyURLSearchParams: class extends URLSearchParams {
    constructor(searchParams: URLSearchParams) {
      super(searchParams)
    }
  },
}))

function setSearchParams(searchParams?: string) {
  mockUseSearchParams.mockReturnValue(
    new ReadonlyURLSearchParams(new URLSearchParams(searchParams))
  )
}

beforeEach(() => {
  setSearchParams()
})

it('renders the default active page number', () => {
  render(<Pagination totalPages={20} />)

  const activePageNumber = screen.getByText('1')

  expect(activePageNumber).toBeInTheDocument()
})

it('renders the active page number', () => {
  setSearchParams('page=3')

  render(<Pagination totalPages={20} />)

  const activePageNumber = screen.getByText('3')

  expect(activePageNumber).toBeInTheDocument()
})

it('renders the "first page" link if the first page is not visible', () => {
  setSearchParams('page=4')

  render(<Pagination totalPages={20} />)

  const firstPageLink = screen.getByRole('link', { name: /first/i })

  expect(firstPageLink).toBeInTheDocument()
})

it('doesn\'t render the "first page" link if the first page is visible', () => {
  setSearchParams('page=3')

  render(<Pagination totalPages={20} />)

  const firstPageLink = screen.queryByRole('link', { name: /first/i })

  expect(firstPageLink).not.toBeInTheDocument()
})

it('renders the "previous page" link if there is a previous page', () => {
  setSearchParams('page=2')

  render(<Pagination totalPages={20} />)

  const previousPageLink = screen.getByRole('link', { name: /previous/i })

  expect(previousPageLink).toBeInTheDocument()
})

it('doesn\'t render the "previous page" link if there is no previous page', () => {
  setSearchParams('page=1')

  render(<Pagination totalPages={20} />)

  const previousPageLink = screen.queryByRole('link', { name: /previous/i })

  expect(previousPageLink).not.toBeInTheDocument()
})

it('renders the three first page numbers', () => {
  setSearchParams()

  render(<Pagination totalPages={20} />)

  const page1Link = screen.getByText('1')

  expect(page1Link).toBeInTheDocument()

  const page2Link = screen.getByText('2')

  expect(page2Link).toBeInTheDocument()

  const page3Link = screen.getByText('3')

  expect(page3Link).toBeInTheDocument()

  const page4Link = screen.queryByText('4')

  expect(page4Link).not.toBeInTheDocument()
})

it('renders the three last page numbers', () => {
  setSearchParams('page=20')

  render(<Pagination totalPages={20} />)

  const page17Link = screen.queryByText('17')

  expect(page17Link).not.toBeInTheDocument()

  const page18Link = screen.getByText('18')

  expect(page18Link).toBeInTheDocument()

  const page19Link = screen.getByText('19')

  expect(page19Link).toBeInTheDocument()

  const page20Link = screen.getByText('20')

  expect(page20Link).toBeInTheDocument()
})

it('renders a maximum of 5 page numbers', () => {
  setSearchParams('page=10')

  render(<Pagination totalPages={20} />)

  const page7Link = screen.queryByText('7')

  expect(page7Link).not.toBeInTheDocument()

  const page8Link = screen.getByText('8')

  expect(page8Link).toBeInTheDocument()

  const page9Link = screen.getByText('9')

  expect(page9Link).toBeInTheDocument()

  const page10Link = screen.getByText('10')

  expect(page10Link).toBeInTheDocument()

  const page11Link = screen.getByText('11')

  expect(page11Link).toBeInTheDocument()

  const page12Link = screen.getByText('12')

  expect(page12Link).toBeInTheDocument()

  const page13Link = screen.queryByText('13')

  expect(page13Link).not.toBeInTheDocument()
})

it('renders the "next page" link if there is a next page', () => {
  setSearchParams()

  render(<Pagination totalPages={20} />)

  const nextPageLink = screen.getByRole('link', { name: /next/i })

  expect(nextPageLink).toBeInTheDocument()
})

it('doesn\'t render the "next page" link if there is no next page', () => {
  setSearchParams('page=20')

  render(<Pagination totalPages={20} />)

  const nextPageLink = screen.queryByRole('link', { name: /next/i })

  expect(nextPageLink).not.toBeInTheDocument()
})

it('renders the "last page" link if the last page is not visible', () => {
  setSearchParams()

  render(<Pagination totalPages={20} />)

  const lastPageLink = screen.getByRole('link', { name: /last/i })

  expect(lastPageLink).toBeInTheDocument()
})

it('doesn\'t render the "last page" link if the last page is visible', () => {
  setSearchParams('page=18')

  render(<Pagination totalPages={20} />)

  const lastPageLink = screen.queryByRole('link', { name: /last/i })

  expect(lastPageLink).not.toBeInTheDocument()
})
