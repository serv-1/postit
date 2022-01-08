import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CloseButton from '../../components/CloseButton'

const handleClick = jest.fn()

type FactoryParams = {
  isWhite?: boolean
  className?: string
}

const factory = ({ isWhite, className }: FactoryParams = {}) => {
  render(
    <CloseButton
      onClick={handleClick}
      isWhite={isWhite}
      className={className}
    />
  )
}

describe('CloseButton', () => {
  it('should use the given onClick handler', () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be white if isWhite is true', () => {
    factory({ isWhite: true })
    expect(screen.getByRole('button')).toHaveClass('btn-close-white')
  })

  it('should use the given className', () => {
    factory({ className: 'btn-danger' })
    expect(screen.getByRole('button')).toHaveClass('btn-danger')
  })
})
