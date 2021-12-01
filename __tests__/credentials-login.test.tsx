import Login from '../pages/auth/credentials-login'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const csrfToken = 'csrfToken'
const email = 'example@test.com'
const password = '0123456789'

describe('Log in form', () => {
  beforeEach(() => render(<Login csrfToken={csrfToken} />))

  describe('CSRF Token', () => {
    it('should have the CSRF token to value', () => {
      expect(screen.getByDisplayValue(csrfToken)).toBeInTheDocument()
    })
  })

  describe('Email', () => {
    it('should show an error message when it is invalid', async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      expect(
        await screen.findByText('The email is not valid.')
      ).toBeInTheDocument()
    })

    it('should show an error message when it is empty', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      expect(
        await screen.findByText('The email cannot be empty.')
      ).toBeInTheDocument()
    })

    it('should not have className `is-valid` at the first render', () => {
      expect(screen.getByLabelText(/email/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is invalid', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-invalid')
    })

    it('should have className `is-valid` when it is not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      userEvent.type(await screen.findByLabelText(/email/i), email)
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is not valid anymore', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      userEvent.clear(await screen.findByLabelText(/email/i))
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-invalid')
    })

    it('should not show the error message when it is not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))

      // We wait until the email feedback appear
      // NOTE: Do not remove it or waitFor...Removed will not work
      await screen.findByText('The email cannot be empty.')
      userEvent.type(screen.getByLabelText(/email/i), email)

      // We wait until the email feeback disappear
      await waitForElementToBeRemoved(() =>
        screen.getByText('The email cannot be empty.')
      )

      expect(
        screen.queryByText('The email cannot be empty.')
      ).not.toBeInTheDocument()
    })
  })

  describe('Password', () => {
    it('should show an error message when it is empty', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      expect(await screen.findByText('The password cannot be empty.'))
    })

    it('should not have className `is-valid` at the first render', () => {
      expect(screen.getByLabelText(/^password/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is invalid', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      expect(await screen.findByLabelText(/^password/i)).toHaveClass(
        'is-invalid'
      )
    })

    it('should have className `is-valid` when it is not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      userEvent.type(await screen.findByLabelText(/^password/i), password)
      expect(await screen.findByLabelText(/^password/i)).toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is not valid anymore', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), password)
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))
      userEvent.clear(await screen.findByLabelText(/^password/i))
      expect(await screen.findByLabelText(/^password/i)).toHaveClass(
        'is-invalid'
      )
    })

    it('should not show the error message when it is not invalid anymore', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Log in' }))

      // We wait until password feedback appear.
      // NOTE: Do not remove it or waitFor...Removed will not work
      await screen.findByText('The password cannot be empty.')
      userEvent.type(await screen.findByLabelText(/^password/i), password)

      // We wait until password feedback disappear.
      await waitForElementToBeRemoved(() =>
        screen.getByText('The password cannot be empty.')
      )

      expect(
        screen.queryByText('The password cannot be empty.')
      ).not.toBeInTheDocument()
    })
  })
})
