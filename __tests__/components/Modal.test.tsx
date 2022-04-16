import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/Modal'

it('renders', async () => {
  render(
    <Modal
      title={'This is a super modal!'}
      renderActionElement={(setIsOpen) => (
        <button onClick={() => setIsOpen(true)} aria-label="Open">
          Open
        </button>
      )}
      renderContent={() => <a href="#">Modality</a>}
    />
  )

  const openBtn = screen.getByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  const title = screen.getByRole('heading')
  expect(title).toHaveTextContent('This is a super modal!')

  const child = screen.getByRole('link')
  expect(child).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  expect(title).not.toBeInTheDocument()
  expect(openBtn).toBeInTheDocument()
})
