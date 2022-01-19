import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/Modal'

const setIsModalOpen = jest.fn()

const factory = () => {
  render(
    <Modal title={'This is a super modal!'} setIsModalOpen={setIsModalOpen}>
      <a href="#">Super modal !</a>
    </Modal>
  )
}

test('the modal renders and can be closed', () => {
  factory()

  const title = screen.getByRole('heading')
  expect(title).toHaveTextContent('This is a super modal!')

  const child = screen.getByRole('link')
  expect(child).toBeInTheDocument()

  const closeBtn = screen.getByRole('button')
  userEvent.click(closeBtn)
  expect(setIsModalOpen).toHaveBeenCalledWith(false)
  expect(setIsModalOpen).toHaveBeenCalledTimes(1)
})
