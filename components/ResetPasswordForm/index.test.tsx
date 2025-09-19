import ResetPasswordForm from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
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
    http.put('http://localhost/api/reset-password', async ({ request }) => {
      expect(await request.json()).toEqual({
        password: '0123456789',
        userId: '0',
        token: 'token',
      })

      return new HttpResponse(null, { status: 204 })
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
    http.put('http://localhost/api/reset-password', async () => {
      return new HttpResponse(null, { status: 204 })
    })
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
    http.put('http://localhost/api/reset-password', async () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
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
