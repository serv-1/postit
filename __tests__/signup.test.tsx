import Signup from '../pages/signup'
import {
  screen,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const email = 'example@test.com'
const password = 'password123456'
const emailReq = 'The email is required.'
const emailInvalid = 'The email is invalid.'
const passReq = 'The password is required.'
const passEqEmail = 'The password cannot be the same as the email.'
const pass10Chars = 'The password must have 10 characters.'
const pass20Chars = 'The password cannot exceed 20 characters.'

describe('Sign up form', () => {
  beforeEach(() => render(<Signup />))

  it('should show server-side validation error if any', async () => {
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password/i), password)
    userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    const serverError = 'This email is not registered.'
    expect(await screen.findByText(serverError)).toBeInTheDocument()
  })

  describe('All fields', () => {
    it('should display an error when it is empty', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      expect(await screen.findByText(emailReq)).toBeInTheDocument()

      // forced to do that to trigger the password required validation
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      expect(await screen.findByText(passReq)).toBeInTheDocument()
    })

    it('should not display an error when values are not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      await screen.findByText(emailReq)
      userEvent.type(screen.getByLabelText(/email/i), email)
      await waitForElementToBeRemoved(() => screen.getByText(emailReq))

      await screen.findByText(passEqEmail)
      userEvent.type(screen.getByLabelText(/^password/i), password)
      await waitForElementToBeRemoved(() => screen.getByText(passEqEmail))

      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('should not have is-valid class at the first render', () => {
      expect(screen.getByLabelText(/email/i)).not.toHaveClass('is-valid')
      expect(screen.getByLabelText(/^password/i)).not.toHaveClass('is-valid')
    })

    it('should have is-invalid class when values are invalid', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      const className = 'is-invalid'
      expect(await screen.findByLabelText(/email/i)).toHaveClass(className)
      expect(await screen.findByLabelText(/^password/i)).toHaveClass(className)
    })

    it('should have is-valid class when values are not invalid anymore', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      userEvent.type(await screen.findByLabelText(/email/i), email)
      userEvent.type(await screen.findByLabelText(/^password/i), password)

      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-valid')
      expect(await screen.findByLabelText(/^password/i)).toHaveClass('is-valid')
    })

    it('should have is-invalid class when values are not valid anymore', async () => {
      userEvent.type(await screen.findByLabelText(/email/i), email)
      userEvent.type(await screen.findByLabelText(/^password/i), password)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

      userEvent.type(await screen.findByLabelText(/email/i), 'bad email')
      userEvent.type(await screen.findByLabelText(/^password/i), 'bad pass')

      const className = 'is-invalid'
      expect(await screen.findByLabelText(/email/i)).toHaveClass(className)
      expect(await screen.findByLabelText(/^password/i)).toHaveClass(className)
    })
  })

  describe('Email field', () => {
    it('should display an error when his value is not an email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(emailInvalid)).toBeInTheDocument()
    })
  })

  describe('Password field', () => {
    it('should display an error when it is smaller than 10 characters', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), 'abc')
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(pass10Chars)).toBeInTheDocument()
    })

    it('should display an error when it is greater than 20 characters', async () => {
      const pw = '012345678901234567890'
      userEvent.type(screen.getByLabelText(/^password/i), pw)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(pass20Chars)).toBeInTheDocument()
    })

    it('should display an error when it is equal to the email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.type(screen.getByLabelText(/^password/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(passEqEmail)).toBeInTheDocument()
    })

    it('should be shown when the show button is clicked', () => {
      userEvent.click(screen.getByRole('button', { name: 'show' }))
      expect(
        (screen.getByLabelText(/^password/i) as HTMLInputElement).type
      ).toBe('text')
    })

    test('show button should have text `hide` when clicked', () => {
      userEvent.click(screen.getByRole('button', { name: 'show' }))
      expect(screen.getByRole('button', { name: 'hide' })).toBeInTheDocument()
    })

    it('should be hidden when the hide button is clicked', () => {
      userEvent.click(screen.getByRole('button', { name: 'show' }))
      userEvent.click(screen.getByRole('button', { name: 'hide' }))
      expect(
        (screen.getByLabelText(/^password/i) as HTMLInputElement).type
      ).toBe('password')
    })

    test('hide button should have text `show` when clicked', () => {
      userEvent.click(screen.getByRole('button', { name: 'show' }))
      userEvent.click(screen.getByRole('button', { name: 'hide' }))
      expect(screen.getByRole('button', { name: 'show' })).toBeInTheDocument()
    })

    it('should show the estimated time to crack it', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), password)
      expect(await screen.findByRole('status')).toBeInTheDocument()
    })

    it('should have className `bg-danger` when the password strength score <= 2', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), password)
      expect(await screen.findByRole('status')).toHaveClass('bg-danger')
    })

    it('should have className `bg-warning` when the password strength score = 3', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), 'epsilon utopy')
      expect(await screen.findByRole('status')).toHaveClass('bg-warning')
    })

    it('should have className `bg-success` when the password strength score = 4', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), 'epsilon utopy dead')
      expect(await screen.findByRole('status')).toHaveClass('bg-success')
    })
  })
})
