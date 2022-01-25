import ForgotPassword from '../../pages/auth/forgot-password'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import { mockResponse } from '../../lib/msw'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')

const factory = () => {
  render(<ForgotPassword />)
}

beforeEach(() => signIn.mockResolvedValue({ error: '' }))

test("the form sends a mail for the user to sign in which redirect him to it's profile", async () => {
  factory()

  const input = screen.getByRole('textbox')
  userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(signIn).toHaveBeenCalledTimes(1)
    expect(signIn).toHaveBeenCalledWith('email', {
      email: 'johndoe@test.com',
      callbackUrl: 'http://localhost:3000/profile',
    })
  })
})

test('an error renders if the server fails to verify the user email', async () => {
  mockResponse('post', '/api/verifyEmail', 422, { message: err.EMAIL_INVALID })

  factory()

  const input = screen.getByRole('textbox')
  userEvent.type(input, 'johndoe@test.com')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.EMAIL_INVALID)

  await waitFor(() => expect(input).toHaveFocus())
})
