import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/Modal'

it('renders', async () => {
  render(
    <Modal<HTMLButtonElement>
      id="modal"
      className="red"
      openerId="modalBtn"
      isFirstFocusableFocused
      renderOpener={(setIsOpen, isOpen) => (
        <button id="modalBtn" onClick={() => setIsOpen(!isOpen)}>
          Open
        </button>
      )}
      renderContent={({ firstFocusable, setIsOpen }) => (
        <button ref={firstFocusable} onClick={() => setIsOpen(false)}>
          Close
        </button>
      )}
    />
  )

  let modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('id', 'modal')
  expect(modal).toHaveClass('red')

  const closeBtn = screen.getByRole('button', { name: /close/i })
  expect(closeBtn).toHaveFocus()
  await userEvent.click(closeBtn)

  expect(modal).not.toBeInTheDocument()
})

test("clicking outside the modal closes it but clicking inside shouldn't", async () => {
  const { container } = render(
    <Modal<HTMLHeadingElement>
      id="modal"
      openerId="modalBtn"
      renderOpener={(setIsOpen, isOpen) => (
        <button id="modalBtn" onClick={() => setIsOpen(!isOpen)}>
          Open
        </button>
      )}
      renderContent={({ firstFocusable }) => (
        <h1 tabIndex={0} ref={firstFocusable}>
          Fabulous modal
        </h1>
      )}
    />
  )

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const modalTitle = screen.getByRole('heading')
  await userEvent.click(modalTitle)
  expect(modalTitle).toBeInTheDocument()

  await userEvent.click(container)
  expect(modalTitle).not.toBeInTheDocument()
})

test("the focus can't leave the modal", async () => {
  render(
    <Modal<HTMLInputElement, HTMLButtonElement>
      id="modal"
      openerId="modalBtn"
      isFirstFocusableFocused
      renderOpener={(setIsOpen, isOpen) => (
        <button id="modalBtn" onClick={() => setIsOpen(!isOpen)}>
          Open
        </button>
      )}
      renderContent={({ firstFocusable, lastFocusable, onShiftTab, onTab }) => (
        <>
          <input type="text" ref={firstFocusable} onKeyDown={onShiftTab} />
          <button ref={lastFocusable} onKeyDown={onTab}>
            Update
          </button>
        </>
      )}
    />
  )

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  await userEvent.tab({ shift: true })

  const updateBtn = screen.getByRole('button', { name: /update/i })
  expect(updateBtn).toHaveFocus()

  await userEvent.tab()

  const input = screen.getByRole('textbox')
  expect(input).toHaveFocus()
})

test('pressing "Escape" close the modal open but not it\'s parent modal if any', async () => {
  render(
    <Modal<HTMLButtonElement, HTMLButtonElement>
      id="parentModal"
      openerId="parentModalOpener"
      isFirstFocusableFocused
      renderOpener={(setIsOpen, isOpen) => (
        <button id="parentModalOpener" onClick={() => setIsOpen(!isOpen)}>
          Open parent modal
        </button>
      )}
      renderContent={({ firstFocusable }) => (
        <Modal<HTMLHeadingElement>
          id="childModal"
          openerId="childModalOpener"
          isFirstFocusableFocused
          renderOpener={(setIsOpen, isOpen) => (
            <button
              ref={firstFocusable}
              id="childModalOpener"
              onClick={() => setIsOpen(!isOpen)}
            >
              Open child modal
            </button>
          )}
          renderContent={({ firstFocusable }) => (
            <h1 tabIndex={0} ref={firstFocusable}>
              Child Modal
            </h1>
          )}
        />
      )}
    />
  )

  const openParentModalBtn = screen.getByRole('button', { name: /parent/i })
  await userEvent.click(openParentModalBtn)

  const openChildModalBtn = screen.getByRole('button', { name: /child/i })
  await userEvent.click(openChildModalBtn)

  await userEvent.keyboard('{Escape}')

  const modals = screen.getAllByRole('dialog')
  expect(modals).toHaveLength(1)

  await userEvent.keyboard('{Escape}')
  expect(modals[0]).toBeInTheDocument()
})
