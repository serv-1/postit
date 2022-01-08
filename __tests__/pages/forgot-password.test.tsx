import ForgotPassword from '../../pages/auth/forgot-password'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')

const csrfToken = 'csrfToken'
const email = 'bob@bob.bob'

const factory = () => {
  render(<ForgotPassword csrfToken={csrfToken} />)
}

describe('ForgotPassword', () => {
  it('should render server-side error', async () => {
    mockResponse('post', '/api/verifyEmail', 405, {
      message: err.METHOD_NOT_ALLOWED,
    })
    factory()
    userEvent.type(screen.getByRole('textbox'), email)
    userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText(err.METHOD_NOT_ALLOWED)).toBeInTheDocument()
  })

  describe('Form', () => {
    it('should call signIn after a valid submission', async () => {
      factory()
      userEvent.type(screen.getByRole('textbox'), email)
      userEvent.click(screen.getByRole('button'))
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('email', {
          email,
          callbackUrl: 'http://localhost:3000/profile',
        })
        expect(signIn).toHaveBeenCalledTimes(1)
      })
    })

    it('should render server-side validation error and focus the field that goes with', async () => {
      mockResponse('post', '/api/verifyEmail', 422, {
        message: err.EMAIL_UNKNOWN,
      })
      factory()
      userEvent.type(screen.getByRole('textbox'), email)
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByText(err.EMAIL_UNKNOWN)).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('should focus the first field at first render', () => {
      factory()
      expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('should not focus the first field after the first render', async () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      await waitFor(() => expect(screen.getByRole('textbox')).not.toHaveFocus())
    })

    describe('CSRF Token', () => {
      it('should be an input type hidden with the CSRF token as value', () => {
        factory()
        const input = screen.getByDisplayValue(csrfToken)
        expect(input).toHaveAttribute('type', 'hidden')
        expect(input).toHaveDisplayValue(csrfToken)
      })
    })

    describe('Email', () => {
      it('should be rendered', () => {
        factory()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })

      it('should display an error when it is empty', async () => {
        factory()
        userEvent.click(screen.getByRole('button'))
        expect(await screen.findByText(err.EMAIL_REQUIRED)).toBeInTheDocument()
      })

      it('should display an error when it is not an email', async () => {
        factory()
        userEvent.type(screen.getByRole('textbox'), 'bad email')
        userEvent.click(screen.getByRole('button'))
        expect(await screen.findByText(err.EMAIL_INVALID)).toBeInTheDocument()
      })
    })
  })
})
