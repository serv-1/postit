import { render, screen } from '@testing-library/react'
import UpdateUserNameForm from '.'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import ProfileUserName from 'components/ProfileUserName'
import Toast from 'components/Toast'
import userEvent from '@testing-library/user-event'

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders a message if the user name has been updated', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ name: 'john' })

      return res(ctx.status(204))
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserNameForm />
    </>
  )

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('Your name has been updated! 🎉')
})

it('updates the username if it has been updated', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ name: 'john' })

      return res(ctx.status(204))
    })
  )

  render(
    <>
      <ProfileUserName name="bob" />
      <UpdateUserNameForm />
    </>
  )

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const username = screen.getByRole('heading')

  expect(username).toHaveTextContent('john')
})

it('renders an error if it fails to update the user name', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <>
      <Toast />
      <UpdateUserNameForm />
    </>
  )

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('gives the focus to the name input if it fails to update the user name', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<UpdateUserNameForm />)

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'john')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  expect(nameInput).toHaveFocus()
})
