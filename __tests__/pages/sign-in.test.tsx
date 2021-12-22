import SignIn from '../../pages/auth/sign-in'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  EMAIL_INVALID,
  EMAIL_REQUIRED,
  EMAIL_UNKNOWN,
  INTERNAL_SERVER_ERROR,
  PASSWORD_REQUIRED,
} from '../../utils/errors'
import { ClientSafeProvider, LiteralUnion } from 'next-auth/react'
const csrfToken = 'csrfToken'
const email = 'example@test.com'
const password = '0123456789'

type MockProvider = Record<
  LiteralUnion<'google' | 'email', string>,
  ClientSafeProvider
> | null
const mockProviders: MockProvider = {
  google: {
    id: 'google',
    callbackUrl: 'http://localhost:3000/api/auth/callback/google',
    name: 'Google',
    signinUrl: 'http://localhost:3000/api/auth/signin/google',
    type: 'oauth',
  },
  email: {
    id: 'email',
    callbackUrl: 'http://localhost:3000/api/auth/callback/email',
    name: 'Email',
    signinUrl: 'http://localhost:3000/api/auth/signin/email',
    type: 'oauth',
  },
  credentials: {
    id: 'credentials',
    callbackUrl: 'http://localhost:3000/api/auth/callback/credentials',
    name: 'Credentials',
    signinUrl: 'http://localhost:3000/api/auth/signin/credentials',
    type: 'oauth',
  },
}

const factory = (providers: MockProvider = null) => {
  render(<SignIn csrfToken={csrfToken} providers={providers} />)
}

jest.mock('next/link', () => {
  return ({ children }: { children: JSX.Element }) => children
})
const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }

beforeEach(() => useRouter.mockReturnValue(router))

describe('Sign in', () => {
  describe('Form', () => {
    it('should redirect to the profile page after a successful submission', async () => {
      factory()
      validSubmission()
      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/profile')
        expect(router.push).toHaveBeenCalledTimes(1)
      })
    })

    it('should render server-side error not related to the fields', async () => {
      signIn.mockResolvedValue({ error: INTERNAL_SERVER_ERROR })
      factory()
      validSubmission()
      expect(await screen.findByText(INTERNAL_SERVER_ERROR)).toBeInTheDocument()
    })

    it('should render server-side validation error and focus the field that goes with', async () => {
      signIn.mockResolvedValue({ error: EMAIL_UNKNOWN })
      factory()
      validSubmission()
      expect(await screen.findByText(EMAIL_UNKNOWN)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()
    })

    it('should focus the first field at first render', () => {
      factory()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()
    })

    it('should not focus the first field after the first render', async () => {
      factory()
      userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
      await waitFor(() =>
        expect(screen.getByLabelText(/email/i)).not.toHaveFocus()
      )
    })

    describe('CSRF token', () => {
      it('should be an input type hidden with the CSRF token as value', () => {
        factory()
        const input = screen.getByDisplayValue(csrfToken)
        expect(input).toHaveAttribute('type', 'hidden')
        expect(input).toHaveDisplayValue(csrfToken)
      })
    })

    describe('Email/Password', () => {
      it('should be rendered', () => {
        factory()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      })

      it('should display an error when it is empty', async () => {
        factory()
        const btn = screen.getByRole('button', { name: 'Sign in' })
        userEvent.click(btn)

        expect(await screen.findByText(EMAIL_REQUIRED)).toBeInTheDocument()

        // avoid the PASSWORD_SAME error
        userEvent.type(screen.getByLabelText(/email/i), 'a')

        expect(await screen.findByText(PASSWORD_REQUIRED)).toBeInTheDocument()
      })
    })

    describe('Email', () => {
      it('should display an error when it is not an email', async () => {
        factory()
        userEvent.type(screen.getByLabelText(/email/i), 'bad email')
        userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
        expect(await screen.findByText(EMAIL_INVALID)).toBeInTheDocument()
      })
    })
  })

  describe('Providers buttons', () => {
    it('should be rendered if providers is not null', () => {
      factory(mockProviders)
      const btn = screen.getAllByRole('button', { name: /sign in with/i })
      expect(btn).not.toHaveLength(0)
    })

    it('should not be rendered if providers is null', () => {
      factory()
      const btn = screen.queryByRole('button', { name: /sign in with/i })
      expect(btn).not.toBeInTheDocument()
    })

    it('should display the provider name', () => {
      factory(mockProviders)
      const btn = screen.getByRole('button', { name: /google/i })
      expect(btn).toBeInTheDocument()
    })

    it('should call signIn with the provider id and the callback url', async () => {
      factory(mockProviders)
      userEvent.click(screen.getByRole('button', { name: /google/i }))
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google', {
          callbackUrl: 'http://localhost:3000/profile',
        })
        expect(signIn).toHaveBeenCalledTimes(1)
      })
    })

    it('should not render the credentials provider', () => {
      factory(mockProviders)
      const btn = screen.queryByRole('button', { name: /credentials/i })
      expect(btn).not.toBeInTheDocument()
    })

    it('should not render the email provider', () => {
      factory(mockProviders)
      const btn = screen.queryByRole('button', { name: /email/i })
      expect(btn).not.toBeInTheDocument()
    })
  })
})

function validSubmission() {
  userEvent.type(screen.getByLabelText(/email/i), email)
  userEvent.type(screen.getByLabelText(/^password/i), password)
  userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}
