import { render, screen } from '@testing-library/react'
import CloseButton from '../../components/CloseButton'

const factory = (isWhite?: boolean) => {
  render(<CloseButton isWhite={isWhite} />)
}

test('the button have btn-close-white class', () => {
  factory(true)

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('btn-close-white')
})

test('the button does not have btn-close-white class', () => {
  factory()

  const btn = screen.getByRole('button')
  expect(btn).not.toHaveClass('btn-close-white')
})
