import AuthenticationForgotPassword from '../../components/AuthenticationForgotPassword'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const setToast = jest.fn()
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL

beforeEach(() => {
  signIn.mockResolvedValue({ error: '' })
  useToast.mockReturnValue({ setToast })
})

test('the form sends a mail to the user to sign in, which redirect him to its profile', async () => {
  render(<AuthenticationForgotPassword setForgotPassword={() => null} />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button', { name: /send/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(signIn).toHaveBeenNthCalledWith(1, 'email', {
      email: 'johndoe@test.com',
      callbackUrl: baseUrl + '/profile',
    })
  })
})

test('an error renders if the server fails to verify the user email', async () => {
  server.use(
    rest.post('http://localhost/api/verifyEmail', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: err.DEFAULT }))
    })
  )

  render(<AuthenticationForgotPassword setForgotPassword={() => null} />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button', { name: /send/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to validate the request data', async () => {
  server.use(
    rest.post('http://localhost/api/verifyEmail', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.EMAIL_INVALID }))
    })
  )

  render(<AuthenticationForgotPassword setForgotPassword={() => null} />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button', { name: /send/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.EMAIL_INVALID)

  expect(input).toHaveFocus()
})

test('the "Back to Auth." button returns the user to the sign in form', async () => {
  const setForgotPassword = jest.fn()
  render(<AuthenticationForgotPassword setForgotPassword={setForgotPassword} />)

  const backToAuthBtn = screen.getByRole('button', { name: /back/i })
  await userEvent.click(backToAuthBtn)

  expect(setForgotPassword).toHaveBeenNthCalledWith(1, false)
})
