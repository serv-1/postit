import Register from '../../pages/register'
import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }

beforeEach(() => {
  signIn.mockResolvedValue({ error: '', ok: true, status: 200, url: null })
  useRouter.mockReturnValue(router)
})

const email = 'example@test.com'
const password = 'password123456'
const name = 'Bobby Tables'

describe('Register form', () => {
  beforeEach(() => render(<Register />))

  it('should sign in the user and redirect to the profile page after a successful submission', async () => {
    mockResponse('post', '/api/user', 200)
    validSubmission()
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/profile')
      expect(router.push).toHaveBeenCalledTimes(1)
    })
  })

  it('should redirect to the sign in page if an error occured while trying to sign in the user', async () => {
    mockResponse('post', '/api/user', 200)
    signIn.mockResolvedValue({ error: 'err', ok: true, status: 200, url: null })
    validSubmission()
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/auth/sign-in')
      expect(router.push).toHaveBeenCalledTimes(1)
    })
  })

  it('should render server-side error not related to the form validation', async () => {
    mockResponse('post', '/api/user', 405, { message: err.METHOD_NOT_ALLOWED })
    validSubmission()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      err.METHOD_NOT_ALLOWED
    )
  })

  it('should render server-side validation error and focus the field that goes with', async () => {
    validSubmission()
    expect(await screen.findByText(err.EMAIL_USED)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toHaveFocus()
  })

  describe('All fields', () => {
    it('should display an error when it is empty', async () => {
      const btn = screen.getByRole('button', { name: 'Register' })
      userEvent.click(btn)

      expect(await screen.findByText(err.NAME_REQUIRED)).toBeInTheDocument()
      expect(await screen.findByText(err.EMAIL_REQUIRED)).toBeInTheDocument()

      // forced to do that to trigger the password required validation
      userEvent.type(screen.getByLabelText(/name/i), name)
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.click(btn)

      expect(await screen.findByText(err.PASSWORD_REQUIRED)).toBeInTheDocument()
    })
  })

  describe('Name', () => {
    it('should display an error when it is greater than 90 characters.', async () => {
      const name = new Uint8Array(91).toString()
      userEvent.type(screen.getByLabelText(/name/i), name)
      userEvent.click(screen.getByRole('button', { name: 'Register' }))
      expect(await screen.findByText(err.NAME_MAX)).toBeInTheDocument()
    })
  })

  describe('Email', () => {
    it('should display an error when it is not an email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button', { name: 'Register' }))
      expect(await screen.findByText(err.EMAIL_INVALID)).toBeInTheDocument()
    })
  })

  describe('Password', () => {
    it('should display an error when it is smaller than 10 characters', async () => {
      userEvent.type(screen.getByLabelText(/^password/i), 'abc')
      userEvent.click(screen.getByRole('button', { name: 'Register' }))
      expect(await screen.findByText(err.PASSWORD_MIN)).toBeInTheDocument()
    })

    it('should display an error when it is greater than 20 characters', async () => {
      const pw = '012345678901234567890'
      userEvent.type(screen.getByLabelText(/^password/i), pw)
      userEvent.click(screen.getByRole('button', { name: 'Register' }))
      expect(await screen.findByText(err.PASSWORD_MAX)).toBeInTheDocument()
    })

    it('should display an error when it is equal to the email', async () => {
      userEvent.type(screen.getByLabelText(/email/i), email)
      userEvent.type(screen.getByLabelText(/^password/i), email)
      userEvent.click(screen.getByRole('button', { name: 'Register' }))
      expect(await screen.findByText(err.PASSWORD_SAME)).toBeInTheDocument()
    })

    it('should display an error when it is equal to the name', async () => {
      userEvent.type(screen.getByLabelText(/name/i), name)
      userEvent.type(screen.getByLabelText(/^password/i), name)
      userEvent.click(screen.getByRole('button', { name: 'Register' }))
      expect(await screen.findByText(err.PASSWORD_SAME)).toBeInTheDocument()
    })
  })
})

function validSubmission() {
  userEvent.type(screen.getByLabelText(/name/i), name)
  userEvent.type(screen.getByLabelText(/email/i), email)
  userEvent.type(screen.getByLabelText(/^password/i), password)
  userEvent.click(screen.getByRole('button', { name: 'Register' }))
}
