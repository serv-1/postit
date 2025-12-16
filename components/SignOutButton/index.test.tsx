import { screen } from '@testing-library/react'
import SignOutButton from '.'
// @ts-expect-error
import { mockSignOut } from 'next-auth/react'
import setup from 'functions/setup'

jest.mock('next-auth/react')

it('signs out the authenticated user on click', async () => {
  const { user } = setup(<SignOutButton>Sign out</SignOutButton>)

  const button = screen.getByRole('button')
  await user.click(button)

  expect(mockSignOut).toHaveBeenNthCalledWith(1, { redirectTo: '/' })
})
