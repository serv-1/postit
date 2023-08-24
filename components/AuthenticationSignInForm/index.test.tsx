import AuthenticationSignInForm from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from 'utils/constants/errors'
import { ClientSafeProvider, LiteralUnion, signIn } from 'next-auth/react'
import server from 'mocks/server'

const mockSetToast = jest.fn()
const mockRouterPush = jest.fn()
const mockSignIn = jest.fn()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next/navigation', () => ({
    useRouter: () => ({ push: mockRouterPush }),
  }))
  .mock('next-auth/react', () => ({
    signIn: (...args: Parameters<typeof signIn>) => mockSignIn(...args),
  }))

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
    expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/profile')
  })
})

test('an error renders if the server fails to sign in the user', async () => {
  mockSignIn.mockResolvedValueOnce({ error: 'error' })

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
    const toast = { message: err.DATA_INVALID, error: true }
    expect(mockSetToast).toHaveBeenNthCalledWith(1, toast)
  })
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
  expect(mockSignIn).toHaveBeenNthCalledWith(1, 'google', {
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
