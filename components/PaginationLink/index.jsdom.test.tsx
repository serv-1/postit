import { render, screen } from '@testing-library/react'
import PaginationLink from '.'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'

const mockUseSearchParams = vi.mocked(useSearchParams)

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: vi.fn(),
}))

function setSearchParams(searchParams?: string) {
  mockUseSearchParams.mockReturnValue(
    new ReadonlyURLSearchParams(new URLSearchParams(searchParams)),
  )
}

it('renders correctly', () => {
  setSearchParams()

  const ariaLabel = 'go to page 1'

  render(
    <PaginationLink page={1} ariaLabel={ariaLabel}>
      1
    </PaginationLink>,
  )

  const link = screen.getByText('1')

  expect(link).toHaveAttribute('aria-label', ariaLabel)
})

it('links to the given page number', () => {
  setSearchParams()

  render(
    <PaginationLink page={1} ariaLabel="1">
      1
    </PaginationLink>,
  )

  const link = screen.getByText('1')

  expect(link).toHaveAttribute('href', '?page=1')
})

it('updates the current page number', () => {
  setSearchParams('page=1')

  render(
    <PaginationLink page={2} ariaLabel="2">
      2
    </PaginationLink>,
  )

  const link = screen.getByText('2')

  expect(link).toHaveAttribute('href', '?page=2')
})
