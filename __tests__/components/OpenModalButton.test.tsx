import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OpenModalButton from '../../components/OpenModalButton'

const setIsModalOpen = jest.fn()

const factory = () => {
  render(
    <OpenModalButton
      name="Open"
      className="btn-primary"
      setIsModalOpen={setIsModalOpen}
    />
  )
}

describe('OpenModalButton', () => {
  it('should render the given name', () => {
    factory()
    expect(screen.getByRole('button')).toHaveTextContent('Open')
  })

  it('should use the given className', () => {
    factory()
    expect(screen.getByRole('button')).toHaveClass('btn-primary')
  })

  it('should call "setIsModalOpen" on click', () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    expect(setIsModalOpen).toHaveBeenCalledWith(true)
    expect(setIsModalOpen).toHaveBeenCalledTimes(1)
  })
})
