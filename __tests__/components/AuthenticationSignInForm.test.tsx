import AuthenticationSignInForm from '../../components/AuthenticationSignInForm'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import { ClientSafeProvider, LiteralUnion } from 'next-auth/react'
import server from '../../mocks/server'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  useRouter.mockReturnValue(router)
  useToastMock.mockReturnValue({ toast: {}, setToast() {} })
})

it('signs in the user and redirects him to its profile', async () => {
  render(
    <AuthenticationSignInForm providers={null} setForgotPassword={() => null} />
  )

  const emailInput = screen.getByRole('textbox')
  expect(emailInput).toHaveFocus()
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenNthCalledWith(1, '/profile')
  })
})

test('an error renders if the server fails to sign in the user', async () => {
  const setToast = jest.fn()
  useToastMock.mockReturnValue({ setToast, toast: {} })
  signIn.mockResolvedValueOnce({
    error: JSON.stringify({ message: err.DEFAULT }),
  })

  render(
    <AuthenticationSignInForm providers={null} setForgotPassword={() => null} />
  )

  const emailInput = screen.getByRole('textbox')
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to validate the request data', async () => {
  signIn.mockResolvedValueOnce({
    error: JSON.stringify({ name: 'email', message: err.EMAIL_INVALID }),
  })

  render(
    <AuthenticationSignInForm providers={null} setForgotPassword={() => null} />
  )

  const emailInput = screen.getByRole('textbox')
  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.EMAIL_INVALID)

  await waitFor(() => expect(emailInput).toHaveFocus())
})

test('the providers render', async () => {
  type MockProvider = Record<
    LiteralUnion<'google' | 'email', string>,
    ClientSafeProvider
  > | null

  const createProvider = (p: string): ClientSafeProvider => ({
    id: p,
    callbackUrl: 'http://localhost:3000/api/auth/callback/' + p,
    name: p[0].toUpperCase() + p.slice(1),
    signinUrl: 'http://localhost:3000/api/auth/signin/' + p,
    type: p[0] === 'g' ? 'oauth' : p[0] === 'c' ? 'credentials' : 'email',
  })

  const mockProviders: MockProvider = {
    google: createProvider('google'),
    email: createProvider('email'),
    credentials: createProvider('credentials'),
  }

  render(
    <AuthenticationSignInForm
      providers={mockProviders}
      setForgotPassword={() => null}
    />
  )

  const googleBtn = screen.getByRole('button', { name: /google/i })
  expect(googleBtn).toBeInTheDocument()

  await userEvent.click(googleBtn)
  expect(signIn).toHaveBeenNthCalledWith(1, 'google', {
    callbackUrl: baseUrl + '/profile',
  })

  const emailBtn = screen.queryByRole('button', { name: /email/i })
  expect(emailBtn).not.toBeInTheDocument()

  const credentialsBtn = screen.queryByRole('button', { name: /credentials/i })
  expect(credentialsBtn).not.toBeInTheDocument()
})

test('the "Forgot password?" button triggers the rendering of the forgot password form', async () => {
  const setForgotPassword = jest.fn()
  render(
    <AuthenticationSignInForm
      providers={null}
      setForgotPassword={setForgotPassword}
    />
  )

  const forgotPwBtn = screen.getByRole('button', { name: /forgot/i })
  await userEvent.click(forgotPwBtn)

  expect(setForgotPassword).toHaveBeenNthCalledWith(1, true)
})
