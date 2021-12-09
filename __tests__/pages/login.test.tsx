import Login from '../../pages/auth/login'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  emailInvalid,
  emailRequired,
  passwordRequired,
} from '../../utils/errors'

const useRouter = jest.spyOn<any, 'useRouter'>(
  require('next/router'),
  'useRouter'
)
const router = { push: jest.fn() }
useRouter.mockReturnValue(router)

afterEach(() => jest.resetAllMocks())

const csrfToken = 'csrfToken'
const email = 'example@test.com'
const password = '0123456789'

describe('Log in form', () => {
  beforeEach(() => render(<Login csrfToken={csrfToken} />))

  it('should redirect to the profile page after a successful submission', async () => {
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password/i), password)
    userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/profile')
      expect(router.push).toHaveBeenCalledTimes(1)
    })
  })

  describe('CSRF token', () => {
    it('should be an input type hidden with the CSRF token as value', () => {
      const input = screen.getByDisplayValue(csrfToken)
      expect(input).toHaveAttribute('type', 'hidden')
      expect(input).toHaveDisplayValue(csrfToken)
    })
  })

  describe('Email/Password', () => {
    it('should be rendered', () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    })

    it('should display an error when it is empty', async () => {
      const btn = screen.getByRole('button', { name: 'Log in' })
      userEvent.click(btn)

      expect(await screen.findByText(emailRequired)).toBeInTheDocument()

      // avoid the passwordEmail error (utils/errors.ts)
      userEvent.type(screen.getByLabelText(/email/i), 'a')

      expect(await screen.findByText(passwordRequired)).toBeInTheDocument()
    })
  })

  describe('Email', () => {
    it('should display an error when it is not an email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      expect(await screen.findByText(emailInvalid)).toBeInTheDocument()
    })
  })
})
