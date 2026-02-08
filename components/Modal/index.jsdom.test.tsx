import { screen } from '@testing-library/react'
import setup from 'functions/setup'
import { useState } from 'react'
import Modal from '.'

it('uses the given class names', async () => {
  setup(
    <Modal className="red" onClose={() => null}>
      ah
    </Modal>,
  )

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('red')
})

it('gives the focus to the first focusable element in the modal', async () => {
  setup(
    <Modal onClose={() => null}>
      <button>ok</button>
    </Modal>,
  )

  const button = screen.getByRole('button')

  expect(button).toHaveFocus()
})

it('closes the modal by clicking outside of it', async () => {
  const onClose = vi.fn()

  const { user } = setup(<Modal onClose={onClose}>ah</Modal>)

  const container = screen.getByRole('dialog').parentElement!
  await user.click(container)

  expect(onClose).toHaveBeenCalledTimes(1)
})

it("doesn't close the modal by clicking inside of it", async () => {
  const onClose = vi.fn()

  const { user } = setup(<Modal onClose={onClose}>ah</Modal>)

  const modal = screen.getByRole('dialog')
  await user.click(modal)

  expect(onClose).not.toHaveBeenCalled()
})

it('closes the modal by pressing "Escape"', async () => {
  const onClose = vi.fn()

  const { user } = setup(
    <Modal onClose={onClose}>
      <button>ok</button>
    </Modal>,
  )

  await user.keyboard('{Escape}')

  expect(onClose).toHaveBeenCalledTimes(1)
})

test("the focus can't leave the modal", async () => {
  const onClose = vi.fn()

  const { user } = setup(
    <Modal onClose={onClose}>
      <input type="text" />
      <button>Update</button>
    </Modal>,
  )

  await user.tab()

  const button = screen.getByRole('button')
  expect(button).toHaveFocus()

  await user.tab()

  const input = screen.getByRole('textbox')
  expect(input).toHaveFocus()

  await user.tab({ shift: true })

  expect(button).toHaveFocus()

  await user.tab({ shift: true })

  expect(input).toHaveFocus()
})

it('removes the modal container from the DOM once the modal is unmounted', async () => {
  function Test() {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <>
        <button onClick={() => setIsOpen(!isOpen)}>open</button>
        {isOpen && <Modal onClose={() => null}>ah</Modal>}
      </>
    )
  }

  const { user } = setup(<Test />)

  const openBtn = screen.getByRole('button', { name: /open/i })
  await user.click(openBtn)

  const container = screen.getByRole('dialog').parentElement!

  container.remove = vi.fn()
  container.removeEventListener = vi.fn()

  await user.click(openBtn)

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

  const { user } = setup(<Test />)

  const openBtn = screen.getByRole('button')
  await user.click(openBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await user.click(closeBtn)

  expect(openBtn).toHaveFocus()
})

it('is hidden', async () => {
  setup(
    <Modal onClose={() => null} isHidden={true}>
      ah
    </Modal>,
  )

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('hidden')
  expect(document.body).not.toHaveClass('overflow-hidden')
})

it('disables the scroll', async () => {
  setup(<Modal onClose={() => null}>ah</Modal>)

  expect(document.body).toHaveClass('overflow-hidden')
})

it('re-enables the scroll on unmount', async () => {
  function Test() {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <button onClick={() => setIsOpen(false)}>open</button>
        {isOpen && <Modal onClose={() => setIsOpen(false)}>ah</Modal>}
      </>
    )
  }

  const { user } = setup(<Test />)

  const openBtn = screen.getByRole('button', { name: /open/i })
  await user.click(openBtn)

  expect(document.body).not.toHaveClass('overflow-hidden')
})

it('handles the scroll correctly with nested modals', async () => {
  function Test() {
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

  const { user } = setup(<Test />)

  expect(document.body).toHaveClass('overflow-hidden')

  const closeChildBtn = screen.getByRole('button', { name: /child/i })
  await user.click(closeChildBtn)

  expect(document.body).toHaveClass('overflow-hidden')

  const closeParentBtn = screen.getByRole('button', { name: /parent/i })
  await user.click(closeParentBtn)

  expect(document.body).not.toHaveClass('overflow-hidden')
})
