import { render, screen } from '@testing-library/react'
import Button from '../../components/Button'

interface FactoryParams {
  type?: 'button' | 'submit' | 'reset'
  className?: string
  gradient?: boolean
}

const factory = ({ type, className, gradient }: FactoryParams = {}) => {
  render(
    <Button type={type} className={className} gradient={gradient}>
      Super button !
    </Button>
  )
}

describe('Button', () => {
  it('should render the children', () => {
    factory()
    expect(screen.getByRole('button')).toHaveTextContent('Super button !')
  })

  it('should have the type "button" by default', () => {
    factory()
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('should use the given className', () => {
    factory({ className: 'red' })
    expect(screen.getByRole('button')).toHaveClass('red')
  })

  it('should have "bg-gradient" if "gradient" is defined', () => {
    factory({ gradient: true })
    expect(screen.getByRole('button')).toHaveClass('bg-gradient')
  })

  it('should not have "bg-gradient" if "gradient" is undefined', () => {
    factory()
    expect(screen.getByRole('button')).not.toHaveClass('bg-gradient')
  })
})
