import { screen } from '@testing-library/react'
import SignOutButton from '.'
import { signOut } from 'next-auth/react'
import setup from 'functions/setup'

const mockSignOut = vi.mocked(signOut)

vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}))

it('signs out the authenticated user on click', async () => {
  const { user } = setup(<SignOutButton>Sign out</SignOutButton>)

  const button = screen.getByRole('button')
  await user.click(button)

  expect(mockSignOut).toHaveBeenNthCalledWith(1, { redirectTo: '/' })
})
