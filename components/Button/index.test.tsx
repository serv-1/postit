import { render, screen } from '@testing-library/react'
import Button from '.'

it('renders with the given color and in full width', () => {
  render(
    <Button color="primary" noRadius="left" fullWidth type="reset">
      Ok
    </Button>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveAttribute('type', 'reset')
  expect(btn).toHaveClass('bg-fuchsia-600 w-full')
})

it('renders with no radius', () => {
  render(
    <Button color="primary" noRadius="left">
      Ok
    </Button>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('rounded-l-none')
  expect(btn).not.toHaveClass('w-full')
})
