import { render, screen } from '@testing-library/react'
import Label from '../../components/Label'

const factory = () => {
  render(<Label labelText="Email" htmlFor="email" className="red" />)
}

describe('Label', () => {
  it('should have "labelText" value to text content', () => {
    factory()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should use the given "htmlFor"', () => {
    factory()
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })

  it('should use the given className', () => {
    factory()
    expect(screen.getByText('Email')).toHaveClass('red')
  })
})
