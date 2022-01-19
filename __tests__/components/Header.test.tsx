import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Header from '../../components/Header'
import { mockSession } from '../../mocks/nextAuth'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const signOut = jest.spyOn(require('next-auth/react'), 'signOut')

const factory = (session?: Session | null) => {
  render(
    <SessionProvider session={session}>
      <Header />
    </SessionProvider>
  )
}

test('no link renders while the user is being fetched', () => {
  factory()

  const signInLink = screen.queryByRole('link', { name: /sign in/i })
  expect(signInLink).not.toBeInTheDocument()

  const signOutLink = screen.queryByRole('link', { name: /sign out/i })
  expect(signOutLink).not.toBeInTheDocument()
})

test('the sign in link renders if the user is unauthenticated', () => {
  factory(null)

  const signInLink = screen.getByRole('link', { name: /sign in/i })
  expect(signInLink).toBeInTheDocument()

  userEvent.click(signInLink)
  expect(signIn).toHaveBeenCalledTimes(1)
})

test('the sign out link renders if the user is authenticated', () => {
  factory(mockSession)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })
  expect(signOutLink).toBeInTheDocument()

  userEvent.click(signOutLink)
  expect(signOut).toHaveBeenCalledTimes(1)
})
