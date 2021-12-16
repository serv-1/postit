import Profile from '../../pages/profile'
import { render, screen } from '@testing-library/react'
import { mockSession } from '../../mocks/nextAuth'
import { SessionProvider } from 'next-auth/react'

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <Profile />
    </SessionProvider>
  )
}

describe('Profile', () => {
  it('should display the user informations', () => {
    factory()
    const name = new RegExp(mockSession.user.name, 'i')
    const email = new RegExp(mockSession.user.email, 'i')
    expect(screen.getByText(name)).toBeInTheDocument()
    expect(screen.getByText(email)).toBeInTheDocument()
  })
})
