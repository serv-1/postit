import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OpenModalButton from '../../components/OpenModalButton'

test('the button renders and open the modal', () => {
  const setIsModalOpen = jest.fn()

  render(<OpenModalButton name="Open" setIsModalOpen={setIsModalOpen} />)

  const openBtn = screen.getByRole('button')
  expect(openBtn).toHaveTextContent('Open')

  userEvent.click(openBtn)
  expect(setIsModalOpen).toHaveBeenNthCalledWith(1, true)
})
