import Profile from '../../pages/profile'
import { render, screen } from '@testing-library/react'
import { mockSession } from '../../mocks/nextAuth'
import { SessionProvider } from 'next-auth/react'

describe('Profile page', () => {
  it('should display the username', () => {
    render(
      <SessionProvider session={mockSession}>
        <Profile />
      </SessionProvider>
    )
    const username = new RegExp(mockSession.user.username, 'i')
    expect(screen.getByText(username)).toBeInTheDocument()
  })
})
