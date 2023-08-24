import { render, screen } from '@testing-library/react'
import DotButton from '.'

it('renders', () => {
  render(<DotButton type="reset">Ok</DotButton>)
  const btn = screen.getByRole('button')
  expect(btn).toHaveTextContent('Ok')
  expect(btn).toHaveAttribute('type', 'reset')
  expect(btn.className).toContain('hover')
  expect(btn.className).toContain('48')
})

it('renders without states', () => {
  render(<DotButton noStates>Ok</DotButton>)
  const btn = screen.getByRole('button')
  expect(btn.className).not.toContain('hover')
})

it('renders being small', () => {
  render(<DotButton isSmall>Ok</DotButton>)
  const btn = screen.getByRole('button')
  expect(btn.className).toContain('32')
})
