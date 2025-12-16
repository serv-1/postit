import HeaderAccountMenu from '.'
import setup from 'functions/setup'
import { screen } from '@testing-library/react'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'

it('renders the given user image', async () => {
  setup(<HeaderAccountMenu userImage="test.png" />)

  const image = screen.getByRole('presentation')
  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/test.png')
})

it('renders the default user image if no user image is given', async () => {
  setup(<HeaderAccountMenu />)

  const image = screen.getByRole('presentation')
  expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
})

it('is closed by default', () => {
  setup(<HeaderAccountMenu />)

  const menu = screen.queryByRole('menu')
  expect(menu).not.toBeInTheDocument()

  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('opens and closes on click', async () => {
  const { user } = setup(<HeaderAccountMenu />)

  const button = screen.getByRole('button')
  await user.click(button)

  const menu = screen.getByRole('menu')
  expect(menu).toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'true')

  await user.click(button)
  expect(menu).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('opens and closes on "Enter" key press', async () => {
  const { user } = setup(<HeaderAccountMenu />)

  const button = screen.getByRole('button')
  button.focus()
  await user.keyboard('{Enter}')

  const menu = screen.getByRole('menu')
  expect(menu).toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard('{Enter}')
  expect(menu).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('opens and closes on "Space" key press', async () => {
  const { user } = setup(<HeaderAccountMenu />)

  const button = screen.getByRole('button')
  button.focus()
  await user.keyboard(' ')

  const menu = screen.getByRole('menu')
  expect(menu).toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard(' ')
  expect(menu).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('closes on "Escape" key press', async () => {
  const { user } = setup(<HeaderAccountMenu />)

  const button = screen.getByRole('button')
  await user.click(button)
  await user.keyboard('{Escape}')

  const menu = screen.queryByRole('menu')
  expect(menu).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('closes on outside click', async () => {
  const { user, container } = setup(<HeaderAccountMenu />)

  const button = screen.getByRole('button')
  await user.click(button)
  await user.click(container)

  const menu = screen.queryByRole('menu')
  expect(menu).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})
