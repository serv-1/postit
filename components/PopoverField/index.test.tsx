import setup from 'functions/setup'
import PopoverField from '.'
import { screen } from '@testing-library/dom'

it('is closed by default', () => {
  setup(<PopoverField label="Test">Content</PopoverField>)

  const popover = screen.queryByRole('dialog')
  expect(popover).not.toBeInTheDocument()

  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('opens and closes on click', async () => {
  const { user } = setup(<PopoverField label="Test">Content</PopoverField>)

  const button = screen.getByRole('button')
  await user.click(button)

  const popover = screen.getByRole('dialog')
  expect(popover).toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'true')

  await user.click(button)
  expect(popover).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('opens and closes on "Enter" key press', async () => {
  const { user } = setup(<PopoverField label="Test">Content</PopoverField>)

  const button = screen.getByRole('button')
  button.focus()
  await user.keyboard('{Enter}')

  const popover = screen.getByRole('dialog')
  expect(popover).toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard('{Enter}')
  expect(popover).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('opens and closes on "Space" key press', async () => {
  const { user } = setup(<PopoverField label="Test">Content</PopoverField>)

  const button = screen.getByRole('button')
  button.focus()
  await user.keyboard(' ')

  const popover = screen.getByRole('dialog')
  expect(popover).toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard(' ')
  expect(popover).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('closes on "Escape" key press', async () => {
  const { user } = setup(<PopoverField label="Test">Content</PopoverField>)

  const button = screen.getByRole('button')
  await user.click(button)
  await user.keyboard('{Escape}')

  const popover = screen.queryByRole('dialog')
  expect(popover).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('closes on outside click', async () => {
  const { user, container } = setup(
    <PopoverField label="Test">Content</PopoverField>
  )

  const button = screen.getByRole('button')
  await user.click(button)
  await user.click(container)

  const popover = screen.queryByRole('dialog')
  expect(popover).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})
