import { render, screen } from '@testing-library/react'
import Button from '../../components/Button'

test('the button renders', () => {
  render(
    <Button className="red" gradient>
      Click
    </Button>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveTextContent('Click')
  expect(btn).toHaveClass('red', 'bg-gradient')
})

test('the button does not have bg-gradient class', () => {
  render(<Button>Click</Button>)

  const btn = screen.getByRole('button')
  expect(btn).not.toHaveClass('bg-gradient')
})
