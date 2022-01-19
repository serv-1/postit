import { render, screen } from '@testing-library/react'
import Label from '../../components/Label'

const factory = () => {
  render(<Label labelText="Email" htmlFor="email" className="red" />)
}

test('the label renders', () => {
  factory()

  const label = screen.getByText('Email')
  expect(label).toBeInTheDocument()
  expect(label).toHaveAttribute('for', 'email')
  expect(label).toHaveClass('red')
})
