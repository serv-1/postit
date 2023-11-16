import { render, screen } from '@testing-library/react'
import UpdateUserPasswordForm from '.'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import ToastProvider from 'components/ToastProvider'
import Toast from 'components/Toast'
import userEvent from '@testing-library/user-event'

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders a message if the user password has been updated', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ password: '0123456789' })

      return res(ctx.status(204))
    })
  )

  render(
    <ToastProvider>
      <Toast />
      <UpdateUserPasswordForm />
    </ToastProvider>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitBtn = screen.getByRole('button', { name: 'Change' })

  await userEvent.click(submitBtn)

  const message = screen.getByText('Your password has been updated! 🎉')

  expect(message).toBeInTheDocument()
})

it('renders an error if it fails to update the user password', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <ToastProvider>
      <Toast />
      <UpdateUserPasswordForm />
    </ToastProvider>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitBtn = screen.getByRole('button', { name: 'Change' })

  await userEvent.click(submitBtn)

  const error = screen.getByText('error')

  expect(error).toBeInTheDocument()
})

it('gives the focus to the password input if it fails to update the user password', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <ToastProvider>
      <Toast />
      <UpdateUserPasswordForm />
    </ToastProvider>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitBtn = screen.getByRole('button', { name: 'Change' })

  await userEvent.click(submitBtn)

  expect(passwordInput).toHaveFocus()
})
