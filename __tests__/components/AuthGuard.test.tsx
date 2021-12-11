import { render as renderRTL, screen, waitFor } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import AuthGuard from '../../components/AuthGuard'
import { mockSession } from '../../mocks/nextAuth'

const signIn = jest.spyOn(require('next-auth/react'), 'signIn')

const Child = () => <div>Welcome!</div>

const render = (session?: Session | null) => {
  renderRTL(
    <SessionProvider session={session}>
      <AuthGuard>
        <Child />
      </AuthGuard>
    </SessionProvider>
  )
}

describe('AuthGuard', () => {
  it('should redirect unauthenticated user', async () => {
    render(null)
    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1))
  })

  it('should display the loading state when the session is being fetched', () => {
    render()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display the child component when the session has been fetched', async () => {
    render(mockSession)
    expect(await screen.findByText(/welcome/i)).toBeInTheDocument()
  })
})
