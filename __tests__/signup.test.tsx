import Signup from '../pages/signup'
import {
  screen,
  render,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const email = 'example@test.com'
const password = 'password123456'

/**
 * Can't find a way to test `required` validation.
 */

describe('Sign up form', () => {
  beforeEach(() => render(<Signup />))

  test('server-side validation error should be displayed when there is error', async () => {
    // alreadyUsed@email.com trigger 422 response (msw) to simulate
    // an already used email
    userEvent.type(screen.getByLabelText(/email/i), 'alreadyUsed@email.com')
    userEvent.type(screen.getByLabelText(/^password$/i), password)
    userEvent.type(screen.getByLabelText(/^confirm/i), password)
    userEvent.click(screen.getByRole('button'))
    expect(
      await screen.findByText('The email is already used.')
    ).toBeInTheDocument()
    expect(await screen.findByLabelText(/email/i)).toHaveFocus()
  })

  test('server-side request error should not be displayed when there is no error', async () => {
    // axios@405.com trigger 405 response (msw) to simulate an unhandled method
    userEvent.type(screen.getByLabelText(/email/i), 'axios@405.com')

    userEvent.type(screen.getByLabelText(/^password$/i), password)
    userEvent.type(screen.getByLabelText(/^confirm/i), password)
    userEvent.click(screen.getByRole('button'))
    expect(
      await screen.findByText(
        'Request go brrr! Try to refresh the page and submit the form again.'
      )
    ).toBeInTheDocument()
  })

  it('should redirect to `/` (home) when form data are valid', async () => {
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password$/i), password)
    userEvent.type(screen.getByLabelText(/^confirm/i), password)
    userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(document.location.pathname).toBe('/'))
  })

  describe('Email', () => {
    it('should show an error message when it is invalid', async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button'))
      expect(
        await screen.findByText('The email is not valid.')
      ).toBeInTheDocument()
    })

    it('should show an error message when it is empty', async () => {
      userEvent.click(screen.getByRole('button'))
      expect(
        await screen.findByText('The email cannot be empty.')
      ).toBeInTheDocument()
    })

    it('should not have className `is-valid` at the first render', () => {
      expect(screen.getByLabelText(/email/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is invalid', async () => {
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-invalid')
    })

    it('should have className `is-valid` when it is not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/email/i), email)
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-valid')
    })

    it('should not show the error message when it is not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button'))

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

  // TODO: beforeEach: render signup -> give value to email input
  describe('Password', () => {
    it('should show an error message when it is smaller than 10 chars.', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), 'azerty')
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByText('The password must have 10 characters.'))
    })

    it('should show an error message when it is greater than 20 chars.', async () => {
      userEvent.type(
        screen.getByLabelText(/^password/i),
        'azerty123456qwerty123456'
      )
      userEvent.click(screen.getByRole('button'))
      expect(
        await screen.findByText('The password cannot exceed 20 characters.')
      )
    })

    it('should show an error message when it is equal to the email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.type(screen.getByLabelText(/^password/i), email)
      userEvent.click(screen.getByRole('button'))
      expect(
        await screen.findByText('The password cannot be the same as email.')
      )
    })

    it('should show an error message when it is empty', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByText('The password cannot be empty.'))
    })

    it('should not have className `is-valid` at the first render', () => {
      expect(screen.getByLabelText(/^password/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is invalid', async () => {
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByLabelText(/^password/i)).toHaveClass(
        'is-invalid'
      )
    })

    it('should have className `is-valid` when it is not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/^password/i), password)
      expect(await screen.findByLabelText(/^password/i)).toHaveClass('is-valid')
    })

    it('should not show the error message when it is not invalid anymore', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(screen.getByRole('button'))

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

  describe('Confirm your password', () => {
    it('should show an error message when it is not equal to the password', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), password)
      userEvent.type(screen.getByLabelText(/^confirm/i), '012')
      userEvent.click(screen.getByRole('button'))
      expect(
        await screen.findByText('Those passwords must be identical.')
      ).toBeInTheDocument()
    })

    it('should not have className `is-valid` at the first render', () => {
      expect(screen.getByLabelText(/^confirm/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` when it is invalid', async () => {
      userEvent.type(screen.getByLabelText(/^confirm/i), '123')
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByLabelText(/^confirm/i)).toHaveClass(
        'is-invalid'
      )
    })

    it('should have className `is-valid` when it is not invalid anymore', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), password)
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/^confirm/i), password)
      expect(await screen.findByLabelText(/^confirm/i)).toHaveClass('is-valid')
    })

    it('should not show the error message when it is not invalid anymore', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), password)
      userEvent.click(screen.getByRole('button'))

      // We wait until confirm_password appear.
      // NOTE: Do not remove it or waitFor...Removed will not work.
      await screen.findByText('Those passwords must be identical.')
      userEvent.type(await screen.findByLabelText(/^confirm/i), password)

      // We wait until confirm_password disappear.
      await waitForElementToBeRemoved(() =>
        screen.getByText('Those passwords must be identical.')
      )

      expect(
        screen.queryByText('Those passwords must be identical.')
      ).not.toBeInTheDocument()
    })
  })
})
