import SignInForm from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from 'components/Toast'
import { DATA_INVALID } from 'constants/errors'

const mockRouterPush = jest.fn()
const mockSignIn = jest.spyOn(require('next-auth/react'), 'signIn')

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

it('signs the user in and redirects him to its profile', async () => {
  render(<SignInForm />)

  const emailInput = screen.getByRole('textbox')

  expect(emailInput).toHaveFocus()

  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })

  await userEvent.click(submitBtn)

  expect(mockRouterPush).toHaveBeenNthCalledWith(1, '/profile')
})

it('renders an error if the server fails to sign the user in', async () => {
  mockSignIn.mockResolvedValueOnce({ error: 'error' })

  render(
    <>
      <Toast />
      <SignInForm />
    </>
  )

  const emailInput = screen.getByRole('textbox')

  await userEvent.type(emailInput, 'johndoe@test.com')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'my super password')

  const submitBtn = screen.getByRole('button', { name: /sign in/i })

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(DATA_INVALID)
})
