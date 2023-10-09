import { render, screen } from '@testing-library/react'
import PageWrapper from '.'

it('renders without the background gradient', () => {
  const { container } = render(<PageWrapper>test</PageWrapper>)

  expect(container.children[0]).not.toHaveClass('bg-linear-page')
})

it('renders with the background gradient', () => {
  const { container } = render(<PageWrapper hasGradient>test</PageWrapper>)

  expect(container.children[0]).toHaveClass('bg-linear-page')
})

it('renders its children', () => {
  render(
    <PageWrapper>
      <h1>Fantastic!</h1>
    </PageWrapper>
  )

  const title = screen.getByRole('heading', { level: 1 })

  expect(title).toBeInTheDocument()
})

it('renders the current year', () => {
  render(<PageWrapper>test</PageWrapper>)

  const year = screen.getByText(new RegExp(new Date().getFullYear().toString()))

  expect(year).toBeInTheDocument()
})
