import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Header from '../../components/Header'
import { mockSession } from '../../mocks/nextAuth'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
const signOut = jest.spyOn(require('next-auth/react'), 'signOut')

const factory = (session: Session | null = mockSession) => {
  render(
    <SessionProvider session={session}>
      <Header />
    </SessionProvider>
  )
}

describe('Header', () => {
  it('should render the sign in link if the user is unauthenticated', () => {
    factory(null)
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('should render the sign out link if the user is authenticated', () => {
    factory()
    expect(screen.getByRole('link', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('should call signIn on click on sign in link', () => {
    factory(null)
    userEvent.click(screen.getByRole('link', { name: 'Sign in' }))
    expect(signIn).toHaveBeenCalledTimes(1)
  })

  it('should call signOut on click on sign out link', () => {
    factory()
    userEvent.click(screen.getByRole('link', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalledTimes(1)
  })
})
