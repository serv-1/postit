import { render, screen } from '@testing-library/react'
import Button from '../../components/Button'

const factory = (gradient?: boolean) => {
  render(
    <Button className="red" gradient={gradient}>
      Super button !
    </Button>
  )
}

test('the button renders', () => {
  factory(true)

  const btn = screen.getByRole('button')
  expect(btn).toHaveTextContent('Super button !')
  expect(btn).toHaveClass('red', 'bg-gradient')
})

test('the button does not have bg-gradient class', () => {
  factory()

  const btn = screen.getByRole('button')
  expect(btn).not.toHaveClass('bg-gradient')
})
