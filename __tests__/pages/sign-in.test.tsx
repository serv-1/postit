import SignIn from '../../pages/auth/sign-in'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import { ClientSafeProvider, LiteralUnion } from 'next-auth/react'
import { ToastProvider } from '../../contexts/toast'
import Toast from '../../components/Toast'

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

const factory = (providers: MockProvider = null) => {
  render(
    <ToastProvider>
      <SignIn providers={providers} />
      <Toast />
    </ToastProvider>
  )
}

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }

beforeEach(() => useRouter.mockReturnValue(router))

test("the form signs in the user and redirect him to it's profile", async () => {
  factory()

  const emailInput = screen.getByRole('textbox')
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith('/profile')
  })
})

test('an error renders if the server fails to sign in the user', async () => {
  signIn.mockResolvedValueOnce({ error: 'Error' })

  factory()

  const emailInput = screen.getByRole('textbox')
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })
  userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent('Error')
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to validate the request data', async () => {
  signIn.mockResolvedValueOnce({ error: err.EMAIL_INVALID })

  factory()

  const emailInput = screen.getByRole('textbox')
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.EMAIL_INVALID)

  await waitFor(() => expect(emailInput).toHaveFocus())
})

test('the providers render', () => {
  factory(mockProviders)

  const googleBtn = screen.getByRole('button', { name: /google/i })
  expect(googleBtn).toBeInTheDocument()

  userEvent.click(googleBtn)
  expect(signIn).toHaveBeenCalledTimes(1)
  expect(signIn).toHaveBeenCalledWith('google', {
    callbackUrl: 'http://localhost:3000/profile',
  })

  const emailBtn = screen.queryByRole('button', { name: /email/i })
  expect(emailBtn).not.toBeInTheDocument()

  const credentialsBtn = screen.queryByRole('button', { name: /credentials/i })
  expect(credentialsBtn).not.toBeInTheDocument()
})
