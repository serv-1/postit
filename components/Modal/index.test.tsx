import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import Modal from '.'

it('uses the given class names', () => {
  render(
    <Modal className="red" onClose={() => null}>
      ah
    </Modal>
  )

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('red')
})

it('gives the focus to the first focusable element in the modal', () => {
  render(
    <Modal onClose={() => null}>
      <button>ok</button>
    </Modal>
  )

  const btn = screen.getByRole('button')

  expect(btn).toHaveFocus()
})

it('closes the modal by clicking outside of it', async () => {
  const onClose = jest.fn()

  render(<Modal onClose={onClose}>ah</Modal>)

  const modal = screen.getByRole('dialog')

  await userEvent.click(modal.parentElement!)

  expect(onClose).toHaveBeenCalledTimes(1)
})

it("doesn't close the modal by clicking inside of it", async () => {
  const onClose = jest.fn()

  render(<Modal onClose={onClose}>ah</Modal>)

  const modal = screen.getByRole('dialog')

  await userEvent.click(modal)

  expect(onClose).not.toHaveBeenCalled()
})

it('closes the modal by pressing "Escape"', async () => {
  const onClose = jest.fn()

  render(
    <Modal onClose={onClose}>
      <button>ok</button>
    </Modal>
  )

  await userEvent.keyboard('{Escape}')

  expect(onClose).toHaveBeenCalledTimes(1)
})

test("the focus can't leave the modal", async () => {
  const onClose = jest.fn()

  render(
    <Modal onClose={onClose}>
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

it('removes the modal container from the DOM once the modal is unmounted', () => {
  const { unmount } = render(<Modal onClose={() => null}>ah</Modal>)

  const container = screen.getByRole('dialog').parentElement!

  container.remove = jest.fn()
  container.removeEventListener = jest.fn()

  unmount()

  expect(container.remove).toHaveBeenCalledTimes(1)
  expect(container.removeEventListener).toHaveBeenCalledTimes(1)
})

it('gives the focus back to the last element focused before the modal is opened on close', async () => {
  const Test = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open</button>
        {isOpen && (
          <Modal onClose={() => setIsOpen(false)}>
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

it('is hidden', () => {
  render(
    <Modal onClose={() => null} isHidden={true}>
      ah
    </Modal>
  )

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('hidden')
  expect(document.body).not.toHaveClass('overflow-hidden')
})

it('disables the scroll', () => {
  render(<Modal onClose={() => null}>ah</Modal>)

  expect(document.body).toHaveClass('overflow-hidden')
})

it('re-enables the scroll on unmount', () => {
  render(<Modal onClose={() => null}>ah</Modal>).unmount()

  expect(document.body).not.toHaveClass('overflow-hidden')
})

it('handles the scroll correctly with nested modals', async () => {
  const Test = () => {
    const [isChildOpen, setIsChildOpen] = useState(true)
    const [isParentOpen, setIsParentOpen] = useState(true)

    return isParentOpen ? (
      <Modal onClose={() => setIsParentOpen(false)}>
        Parent Modal
        <button onClick={() => setIsParentOpen(false)}>Close Parent</button>
        {isChildOpen && (
          <Modal onClose={() => setIsChildOpen(false)}>
            Child Modal
            <button onClick={() => setIsChildOpen(false)}>Close child</button>
          </Modal>
        )}
      </Modal>
    ) : null
  }

  render(<Test />)

  expect(document.body).toHaveClass('overflow-hidden')

  const closeChildBtn = screen.getByRole('button', { name: /child/i })

  await userEvent.click(closeChildBtn)

  expect(document.body).toHaveClass('overflow-hidden')

  const closeParentBtn = screen.getByRole('button', { name: /parent/i })

  await userEvent.click(closeParentBtn)

  expect(document.body).not.toHaveClass('overflow-hidden')
})
