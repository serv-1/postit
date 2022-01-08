import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/Modal'

const setIsModalOpen = jest.fn()
const title = 'This is a super modal!'

const factory = () => {
  render(
    <Modal title={title} setIsModalOpen={setIsModalOpen}>
      Super modal !
    </Modal>
  )
}

describe('Modal', () => {
  it('should render the given children', () => {
    factory()
    expect(screen.getByText('Super modal !')).toBeInTheDocument()
  })

  it('should render the given title', () => {
    factory()
    expect(screen.getByRole('heading')).toHaveTextContent(title)
  })

  it('should call "setIsModalOpen" when the close button is clicked', () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    expect(setIsModalOpen).toHaveBeenCalledWith(false)
    expect(setIsModalOpen).toHaveBeenCalledTimes(1)
  })
})
