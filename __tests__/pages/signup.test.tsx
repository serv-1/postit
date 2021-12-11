import Signup from '../../pages/signup'
import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../../mocks/server'
import {
  EMAIL_INVALID,
  EMAIL_REQUIRED,
  EMAIL_USED,
  PASSWORD_SAME,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PASSWORD_REQUIRED,
  USERNAME_MAX,
  USERNAME_REQUIRED,
} from '../../utils/errors'
import { rest } from 'msw'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }

beforeEach(() => useRouter.mockReturnValue(router))

const email = 'example@test.com'
const password = 'password123456'
const username = 'Bobby Tables'

describe('Sign up form', () => {
  beforeEach(() => render(<Signup />))

  it('should log in the user and redirect to the profile page after a successful submission', async () => {
    server.use(
      rest.post('http://localhost:3000/api/users', (req, res, ctx) => {
        return res(ctx.status(200))
      })
    )
    userEvent.type(screen.getByLabelText(/username/i), username)
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password/i), password)
    userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/profile')
      expect(router.push).toHaveBeenCalledTimes(1)
    })
  })

  it('should redirect to the home page after a successful submission if something bad happen with the user log in', async () => {
    server.use(
      rest.post('http://localhost:3000/api/users', (req, res, ctx) => {
        return res(ctx.status(200))
      })
    )
    signIn.mockResolvedValue({
      error: 'Error',
      ok: false,
      status: 500,
      url: null,
    })
    userEvent.type(screen.getByLabelText(/username/i), username)
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password/i), password)
    userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/')
      expect(router.push).toHaveBeenCalledTimes(1)
    })
  })

  it('should render server-side error', async () => {
    userEvent.type(screen.getByLabelText(/username/i), username)
    userEvent.type(screen.getByLabelText(/email/i), email)
    userEvent.type(screen.getByLabelText(/^password/i), password)
    userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByText(EMAIL_USED)).toBeInTheDocument()
  })

  it('should focus the first field at first render', () => {
    expect(screen.getByLabelText(/username/i)).toHaveFocus()
  })

  it('should not focus the first field after the first render', async () => {
    userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    await waitFor(() =>
      expect(screen.getByLabelText(/username/i)).not.toHaveFocus()
    )
  })

  describe('All fields', () => {
    it('should be rendered correctly', () => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    })

    it('should display an error when it is empty', async () => {
      const btn = screen.getByRole('button', { name: 'Sign up' })
      userEvent.click(btn)

      expect(await screen.findByText(USERNAME_REQUIRED)).toBeInTheDocument()
      expect(await screen.findByText(EMAIL_REQUIRED)).toBeInTheDocument()

      // forced to do that to trigger the password required validation
      userEvent.type(screen.getByLabelText(/username/i), username)
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(btn)

      expect(await screen.findByText(PASSWORD_REQUIRED)).toBeInTheDocument()
    })
  })

  describe('Username', () => {
    it('should display an error when it is greater than 90 characters.', async () => {
      let username = ''
      for (let i = 0; i < 91; i++) username += '.'
      userEvent.type(screen.getByLabelText(/username/i), username)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(USERNAME_MAX)).toBeInTheDocument()
    })
  })

  describe('Email', () => {
    it('should display an error when it is not an email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(EMAIL_INVALID)).toBeInTheDocument()
    })
  })

  describe('Password', () => {
    it('should display an error when it is smaller than 10 characters', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), 'abc')
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(PASSWORD_MIN)).toBeInTheDocument()
    })

    it('should display an error when it is greater than 20 characters', async () => {
      const pw = '012345678901234567890'
      userEvent.type(screen.getByLabelText(/^password/i), pw)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(PASSWORD_MAX)).toBeInTheDocument()
    })

    it('should display an error when it is equal to the email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.type(screen.getByLabelText(/^password/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(PASSWORD_SAME)).toBeInTheDocument()
    })

    it('should display an error when it is equal to the username', async () => {
      userEvent.type(screen.getByLabelText(/username/i), username)
      userEvent.type(screen.getByLabelText(/^password/i), username)
      userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
      expect(await screen.findByText(PASSWORD_SAME)).toBeInTheDocument()
    })
  })
})
