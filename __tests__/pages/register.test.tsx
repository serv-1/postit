import Register from '../../pages/register'
import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/errors'
import { mockResponse } from '../../utils/msw'
import { ToastProvider } from '../../contexts/toast'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }

beforeEach(() => {
  signIn.mockResolvedValue({ error: '' })
  useRouter.mockReturnValue(router)
})

const factory = () => {
  render(
    <ToastProvider>
      <Register />
    </ToastProvider>
  )
}

test("the form registers the user, sends him a mail, signs in him and redirects him to it's profile", async () => {
  factory()

  const nameInput = screen.getByLabelText(/name/i)
  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(signIn).toHaveBeenCalledWith('email', {
      email: 'johndoe@test.com',
      callbackUrl: 'http://localhost:3000/profile',
      redirect: false,
    })

    expect(router.push).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith('/profile')
  })
})

test('the forms redirects the user to the sign in page if it fails to do it', async () => {
  signIn.mockResolvedValue({ error: 'Error' })

  factory()

  const nameInput = screen.getByLabelText(/name/i)
  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith('/auth/sign-in')
  })
})

test('validation errors and server errors are rendered separatly', async () => {
  mockResponse('post', '/api/user', 405, { message: err.METHOD_NOT_ALLOWED })

  factory()

  const submitBtn = screen.getByRole('button', { name: /register/i })
  userEvent.click(submitBtn)

  const alerts = await screen.findAllByRole('alert')
  expect(alerts[0]).toHaveTextContent(err.NAME_REQUIRED)

  const nameInput = screen.getByLabelText(/name/i)
  expect(nameInput).toHaveFocus()

  userEvent.type(nameInput, 'John Doe')

  const emailInput = screen.getByLabelText(/email/i)
  userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)
  userEvent.type(passwordInput, 'my super password')

  userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.METHOD_NOT_ALLOWED)
  expect(toast).toHaveClass('bg-danger')
})
