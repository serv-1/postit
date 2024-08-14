import { render, screen } from '@testing-library/react'
import PaginationPageLink from '.'

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

it('renders correctly', () => {
  render(<PaginationPageLink page={1} />)

  const pageLink = screen.getByText('1')

  expect(pageLink).toHaveAttribute('aria-label', 'Go to page 1')
})
