import Profile from '../../pages/profile'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('../../contexts/toast', () => ({
  __esModule: true,
  useToast: () => ({}),
}))

const user = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Mario',
  email: 'mario@mushroomkingdom.mu',
  image: 'itsmemario.jpeg',
  posts: [],
}

it('renders', () => {
  render(<Profile user={user} />)

  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveTextContent(user.name)

  const publicProfileLink = screen.getByRole('link', { name: /public/i })
  expect(publicProfileLink).toHaveAttribute(
    'href',
    `/users/${user.id}/${user.name}`
  )
})

it('the user is signed out', async () => {
  const signOut = jest.spyOn(require('next-auth/react'), 'signOut')
  render(<Profile user={user} />)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })
  await userEvent.click(signOutLink)

  expect(signOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
})
