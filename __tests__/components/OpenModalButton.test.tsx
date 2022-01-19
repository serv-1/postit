import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OpenModalButton from '../../components/OpenModalButton'

const setIsModalOpen = jest.fn()

const factory = () => {
  render(<OpenModalButton name="Open" setIsModalOpen={setIsModalOpen} />)
}

test('the button renders and open the modal', () => {
  factory()

  const openBtn = screen.getByRole('button')
  expect(openBtn).toHaveTextContent('Open')

  userEvent.click(openBtn)
  expect(setIsModalOpen).toHaveBeenCalledWith(true)
  expect(setIsModalOpen).toHaveBeenCalledTimes(1)
})
