import { render, screen } from '@testing-library/react'
import SignOutButton from '.'
import userEvent from '@testing-library/user-event'
// @ts-expect-error
import { mockSignOut } from 'next-auth/react'

jest.mock('next-auth/react')

it('renders the given children', () => {
  render(<SignOutButton>Sign out</SignOutButton>)

  const text = screen.getByText('Sign out')

  expect(text).toBeInTheDocument()
})

it('renders the given class names', () => {
  render(<SignOutButton className="primary-btn">Sign out</SignOutButton>)

  const btn = screen.getByRole('button')

  expect(btn).toHaveClass('primary-btn')
})

it('signs the authenticated user out', async () => {
  render(<SignOutButton>Sign out</SignOutButton>)

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockSignOut).toHaveBeenNthCalledWith(1, { redirectTo: '/' })
})
