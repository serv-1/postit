import ResetPasswordForm from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import Toast from 'components/Toast'

const server = setupServer()
const mockRouterPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("doesn't render the error message if there is no error", () => {
  render(<ResetPasswordForm userId="0" token="token" />)

  const message = screen.queryByRole('alert')

  expect(message).not.toBeInTheDocument()
})

it('renders the success message if the server successfully resets the password', async () => {
  server.use(
    rest.put('http://localhost/api/reset-password', async (req, res, ctx) => {
      expect(await req.json()).toEqual({
        password: '0123456789',
        userId: '0',
        token: 'token',
      })

      return res(ctx.status(204))
    })
  )

  render(
    <>
      <Toast />
      <ResetPasswordForm userId="0" token="token" />
    </>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitButton = screen.getByRole('button', { name: /confirm/i })

  await userEvent.click(submitButton)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('Your password has been updated! 🎉')
})

it('redirects to the authentication page if the server successfully resets the password', async () => {
  server.use(
    rest.put('http://localhost/api/reset-password', async (req, res, ctx) =>
      res(ctx.status(204))
    )
  )

  render(<ResetPasswordForm userId="0" token="token" />)

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitButton = screen.getByRole('button', { name: /confirm/i })

  await userEvent.click(submitButton)

  expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/authentication')
})

it('renders the error message if the server fails to reset the password', async () => {
  server.use(
    rest.put('http://localhost/api/reset-password', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <>
      <Toast />
      <ResetPasswordForm userId="0" token="token" />
    </>
  )

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, '0123456789')

  const submitButton = screen.getByRole('button', { name: /confirm/i })

  await userEvent.click(submitButton)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})
