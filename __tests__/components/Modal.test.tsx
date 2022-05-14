import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import Modal from '../../components/Modal'

it('renders', async () => {
  const setIsOpen = jest.fn()

  render(
    <Modal className="red" setIsOpen={setIsOpen}>
      <button>Ok</button>
    </Modal>
  )

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveClass('red')

  const btn = screen.getByRole('button')
  expect(btn).toHaveFocus()
})

test("clicking in the modal don't close it but clicking outside (in the modal container) should", async () => {
  const setIsOpen = jest.fn()

  render(
    <Modal setIsOpen={setIsOpen}>
      <h1>Fabulous modal</h1>
    </Modal>
  )

  const modal = screen.getByRole('dialog')
  await userEvent.click(modal)
  expect(setIsOpen).not.toHaveBeenCalled()

  await userEvent.click(modal.parentElement as HTMLElement)
  expect(setIsOpen).toHaveBeenNthCalledWith(1, false)
})

test("the focus can't leave the modal", async () => {
  const setIsOpen = jest.fn()

  render(
    <Modal setIsOpen={setIsOpen}>
      <input type="text" />
      <button>Update</button>
    </Modal>
  )

  await userEvent.tab()

  const btn = screen.getByRole('button')
  expect(btn).toHaveFocus()

  await userEvent.tab()

  const input = screen.getByRole('textbox')
  expect(input).toHaveFocus()

  await userEvent.tab({ shift: true })
  expect(btn).toHaveFocus()

  await userEvent.tab({ shift: true })
  expect(input).toHaveFocus()
})

test('pressing "Escape" close the modal but not its parent modal', async () => {
  const setIsParentOpen = jest.fn()
  const setIsChildOpen = jest.fn()

  render(
    <Modal setIsOpen={setIsParentOpen}>
      <Modal setIsOpen={setIsChildOpen}>
        <h1 tabIndex={0}>Child Modal</h1>
      </Modal>
    </Modal>
  )

  await userEvent.keyboard('{Escape}')

  expect(setIsChildOpen).toHaveBeenNthCalledWith(1, false)
  expect(setIsParentOpen).not.toHaveBeenCalled()
})

test('the modal container is removed from the DOM once the modal is unmounted', () => {
  const { unmount } = render(
    <Modal setIsOpen={() => null}>
      <h1>Fabulous modal</h1>
    </Modal>
  )

  const container = screen.getByRole('dialog').parentElement as HTMLElement
  container.remove = jest.fn()
  container.removeEventListener = jest.fn()

  unmount()

  expect(container.remove).toHaveBeenCalledTimes(1)
  expect(container.removeEventListener).toHaveBeenCalledTimes(1)
})

test('when the modal is closed, the focus goes back to the last element focused before the modal opens', async () => {
  const Test = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open</button>
        {isOpen && (
          <Modal setIsOpen={setIsOpen}>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </Modal>
        )}
      </>
    )
  }

  render(<Test />)

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  expect(openBtn).toHaveFocus()
})
