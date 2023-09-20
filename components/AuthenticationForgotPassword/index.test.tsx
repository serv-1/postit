import AuthenticationForgotPassword from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'

const mockSetToast = jest.fn()
const mockSignIn = jest.spyOn(require('next-auth/react'), 'signIn')
const server = setupServer()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeEach(() => {
  mockSignIn.mockResolvedValue({ error: '' })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('sends a mail to sign the user in', async () => {
  server.use(
    rest.post('http://localhost/api/verify-email', async (req, res, ctx) => {
      expect(await req.json()).toEqual({ email: 'john@test.com' })

      return res(ctx.status(204))
    })
  )

  render(<AuthenticationForgotPassword setForgotPassword={() => null} />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'john@test.com')

  const submitBtn = screen.getByRole('button', { name: /send/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSignIn).toHaveBeenNthCalledWith(1, 'email', {
      email: 'john@test.com',
      callbackUrl: NEXT_PUBLIC_VERCEL_URL + '/profile',
    })
  })
})

it('renders an error if the server fails to verify the user email', async () => {
  server.use(
    rest.post('http://localhost/api/verify-email', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<AuthenticationForgotPassword setForgotPassword={() => null} />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'john@test.com')

  const submitBtn = screen.getByRole('button', { name: /send/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('renders an error if the server fails to validate the request data', async () => {
  server.use(
    rest.post('http://localhost/api/verify-email', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: 'error' }))
    })
  )

  render(<AuthenticationForgotPassword setForgotPassword={() => null} />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'john@test.com')

  const submitBtn = screen.getByRole('button', { name: /send/i })

  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent('error')
  expect(input).toHaveFocus()
})

it('returns the user to the sign in form', async () => {
  const setForgotPassword = jest.fn()

  render(<AuthenticationForgotPassword setForgotPassword={setForgotPassword} />)

  const backToAuthBtn = screen.getByRole('button', { name: /back/i })

  await userEvent.click(backToAuthBtn)

  expect(setForgotPassword).toHaveBeenNthCalledWith(1, false)
})
