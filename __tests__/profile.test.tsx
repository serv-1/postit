import Profile from '../pages/profile'
import { render, screen } from '@testing-library/react'
import { mockSession } from '../mocks/nextAuth'
import { SessionProvider } from 'next-auth/react'

describe('Profile page', () => {
  it('should display the user email', () => {
    render(
      <SessionProvider session={mockSession}>
        <Profile />
      </SessionProvider>
    )
    const email = new RegExp(mockSession.user.email, 'i')
    expect(screen.getByText(email)).toBeInTheDocument()
  })
})
