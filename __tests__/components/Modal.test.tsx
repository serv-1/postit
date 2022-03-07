import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/Modal'

test('the modal renders and can be closed', () => {
  const setIsModalOpen = jest.fn()

  render(
    <Modal title={'This is a super modal!'} setIsOpen={setIsModalOpen}>
      <a href="#">Modality</a>
    </Modal>
  )

  const title = screen.getByRole('heading')
  expect(title).toHaveTextContent('This is a super modal!')

  const child = screen.getByRole('link')
  expect(child).toBeInTheDocument()

  const closeBtn = screen.getByRole('button')
  userEvent.click(closeBtn)
  expect(setIsModalOpen).toHaveBeenNthCalledWith(1, false)
})
