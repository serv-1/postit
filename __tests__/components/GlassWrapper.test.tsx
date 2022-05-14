import { render, screen } from '@testing-library/react'
import GlassWrapper from '../../components/GlassWrapper'

it('renders', () => {
  render(
    <GlassWrapper>
      <h1></h1>
    </GlassWrapper>
  )

  const title = screen.getByRole('heading')
  expect(title).toBeInTheDocument()

  const glassWrapper = title.parentElement
  expect(glassWrapper).toHaveClass('p-32')
})

it('renders with the given minimum height and padding', () => {
  render(
    <GlassWrapper minHeight="h-24" padding="p-16">
      <h1></h1>
    </GlassWrapper>
  )

  const glassWrapper = screen.getByRole('heading').parentElement
  expect(glassWrapper).toHaveClass('h-24 p-16')
})
