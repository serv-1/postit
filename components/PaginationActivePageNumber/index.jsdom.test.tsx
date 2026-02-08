import { render, screen } from '@testing-library/react'
import PaginationActivePageNumber from '.'

it('renders correctly', () => {
  render(<PaginationActivePageNumber page={1} />)

  const pageNumber = screen.getByText('1')

  expect(pageNumber).toHaveAttribute('aria-label', 'Page 1')
})
