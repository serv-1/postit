import { render as renderRTL, screen, waitFor } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import AuthGuard from '../../components/AuthGuard'
import { mockSession } from '../../mocks/nextAuth'

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
  it('should redirect unauthenticated user to the log in page', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: window.location.href },
      writable: true,
    })

    render(null)
    await waitFor(() => {
      expect(window.location.href).toBe(
        `/api/auth/signin?callbackUrl=${encodeURIComponent(
          'http://localhost:3000/api/auth/signin'
        )}`
      )
    })

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
    })
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
