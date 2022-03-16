import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/Modal'

test('the modal renders', () => {
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

  let openBtn = screen.getByRole('button', { name: /open/i })
  userEvent.click(openBtn)

  let title: HTMLElement | null = screen.getByRole('heading')
  expect(title).toHaveTextContent('This is a super modal!')

  const child = screen.getByRole('link')
  expect(child).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })
  userEvent.click(closeBtn)

  title = screen.queryByRole('heading')
  expect(title).not.toBeInTheDocument()

  openBtn = screen.getByRole('button', { name: /open/i })
  expect(openBtn).toBeInTheDocument()
})
