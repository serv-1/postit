import { render, screen, waitFor } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import AuthGuard from '../../components/AuthGuard'
import { mockSession } from '../../mocks/nextAuth'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')

const factory = (session?: Session | null) => {
  return render(
    <SessionProvider session={session}>
      <AuthGuard>
        <h1>Welcome!</h1>
      </AuthGuard>
    </SessionProvider>
  )
}

test('the AuthGuard redirects unauthenticated user', async () => {
  factory(null)
  await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1))
})

test('the loading state renders', async () => {
  factory()

  const loadingState = screen.getByText(/loading/i)
  expect(loadingState).toBeInTheDocument()
})

test('the child component renders', () => {
  factory(mockSession)

  const child = screen.getByRole('heading')
  expect(child).toBeInTheDocument()
})
