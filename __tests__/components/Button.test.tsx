import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../../components/Button'

const handleClick = jest.fn()

const factory = () => {
  render(
    <Button
      ariaLabel={'send mail'}
      className="btn-primary"
      onClick={handleClick}
    >
      Super button !
    </Button>
  )
}

describe('Button', () => {
  it('should render children', () => {
    factory()
    expect(screen.getByRole('button')).toHaveTextContent('Super button !')
  })

  it('should have the given class', () => {
    factory()
    expect(screen.getByRole('button')).toHaveClass('btn-primary')
  })

  it('should use the given onClick handler', () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should have the given aria-label', () => {
    factory()
    expect(screen.getByRole('button')).toHaveAccessibleName('send mail')
  })
})
