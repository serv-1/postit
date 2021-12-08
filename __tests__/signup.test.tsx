import Signup from '../pages/signup'
import { screen, render } from '@testing-library/react'
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
const serverError = 'This email is not registered.'

describe('Sign up form', () => {
  beforeEach(() => render(<Signup />))

  it('should render server-side error', async () => {
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password/i), password)
    userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByText(serverError)).toBeInTheDocument()
  })

  describe('All fields', () => {
    it('should be rendered correctly', () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    })

    it('should display an error when it is empty', async () => {
      const btn = screen.getByRole('button', { name: 'Sign up' })
      userEvent.click(btn)

      expect(await screen.findByText(emailReq)).toBeInTheDocument()

      // forced to do that to trigger the password required validation
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(btn)

      expect(await screen.findByText(passReq)).toBeInTheDocument()
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
  })
})
