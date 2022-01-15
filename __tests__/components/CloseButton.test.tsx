import { render, screen } from '@testing-library/react'
import CloseButton from '../../components/CloseButton'

interface FactoryParams {
  isWhite?: boolean
}

const factory = ({ isWhite }: FactoryParams = {}) => {
  render(<CloseButton isWhite={isWhite} />)
}

describe('CloseButton', () => {
  it('should be white if "isWhite" is defined', () => {
    factory({ isWhite: true })
    expect(screen.getByRole('button')).toHaveClass('btn-close-white')
  })

  it('should not be white if "isWhite" is undefined', () => {
    factory()
    expect(screen.getByRole('button')).not.toHaveClass('btn-close-white')
  })
})
