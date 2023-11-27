import { render, screen } from '@testing-library/react'
import SignInProviderButton from '.'
import userEvent from '@testing-library/user-event'

const mockSignIn = jest.spyOn(require('next-auth/react'), 'signIn')

it('renders its children', () => {
  render(
    <SignInProviderButton id="google">Sign in with Google</SignInProviderButton>
  )

  const btn = screen.getByRole('button')

  expect(btn).toHaveTextContent('Sign in with Google')
})

it('signs the user in using the given provider', async () => {
  mockSignIn.mockResolvedValueOnce({})

  render(
    <SignInProviderButton id="google">Sign in with Google</SignInProviderButton>
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSignIn).toHaveBeenNthCalledWith(1, 'google', {
    callbackUrl: 'http://localhost/profile',
  })
})
