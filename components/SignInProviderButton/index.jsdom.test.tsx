import { render, screen } from '@testing-library/react'
import SignInProviderButton from '.'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'

const mockSignIn = vi.mocked(signIn)

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

it('renders its children', () => {
  render(
    <SignInProviderButton id="google">
      Sign in with Google
    </SignInProviderButton>,
  )

  const btn = screen.getByRole('button')

  expect(btn).toHaveTextContent('Sign in with Google')
})

it('signs the user in using the given provider', async () => {
  render(
    <SignInProviderButton id="google">
      Sign in with Google
    </SignInProviderButton>,
  )

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSignIn).toHaveBeenNthCalledWith(1, 'google', {
    redirectTo: 'http://localhost/profile',
  })
})
