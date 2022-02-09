import { render, screen } from '@testing-library/react'
import CloseButton from '../../components/CloseButton'

test('the button have btn-close-white class', () => {
  render(<CloseButton isWhite />)

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('btn-close-white')
})

test('the button does not have btn-close-white class', () => {
  render(<CloseButton />)

  const btn = screen.getByRole('button')
  expect(btn).not.toHaveClass('btn-close-white')
})
