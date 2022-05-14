import { render, screen } from '@testing-library/react'
import DotButton from '../../components/DotButton'

it('renders with the "heart" style', () => {
  render(
    <DotButton style="heart" type="reset">
      heart
    </DotButton>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveAttribute('type', 'reset')
  expect(btn).toHaveClass('p-8 bg-fuchsia-50 group')
  expect(btn).toHaveTextContent('heart')
})

it('renders with the "chat" style', () => {
  render(<DotButton style="chat">chat</DotButton>)

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('p-8 fixed')
})

it('renders with other style', () => {
  render(<DotButton style="x">x</DotButton>)

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('p-8 bg-fuchsia-50 hover:bg-fuchsia-900 z-20')
})
