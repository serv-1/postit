import { render, screen } from '@testing-library/react'
import Label from '../../components/Label'

test('the label renders', () => {
  render(<Label labelText="Email" htmlFor="email" className="red" />)

  const label = screen.getByText('Email')
  expect(label).toBeInTheDocument()
  expect(label).toHaveAttribute('for', 'email')
  expect(label).toHaveClass('red')
})
