import Profile from '../../pages/profile'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../../mocks/server'

jest.mock('../../contexts/toast', () => ({
  __esModule: true,
  useToast: () => ({}),
}))

const setToast = jest.fn()
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const signOut = jest.spyOn(require('next-auth/react'), 'signOut')

beforeEach(() => useToast.mockReturnValue({ setToast }))
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const user = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'John Doe',
  email: 'doe@doe.doe',
  image: 'john.jpeg',
  posts: [],
  favPosts: [],
  discussionsIds: [],
  hasUnseenMessages: false,
  channelName: 'test',
}

it('renders', () => {
  render(<Profile user={user} />)

  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveTextContent(user.name)

  const publicProfileLink = screen.getByRole('link', { name: /public/i })
  expect(publicProfileLink).toHaveAttribute(
    'href',
    `/users/${user.id}/John-Doe`
  )
})

it('the user is signed out', async () => {
  render(<Profile user={user} />)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })
  await userEvent.click(signOutLink)

  expect(signOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
})

it('updates the user name if it has been changed', async () => {
  render(<Profile user={user} csrfToken="csrf" />)

  const nameInput = screen.getByLabelText(/name/i)
  await userEvent.type(nameInput, 'Bob')

  const submitBtn = screen.getAllByRole('button', { name: /change/i })[0]
  await userEvent.click(submitBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))

  const userName = screen.getByRole('heading', { level: 1 })
  expect(userName).toHaveTextContent('Bob')

  const publicProfileLink = screen.getByRole('link', { name: /public/i })
  expect(publicProfileLink).toHaveAttribute('href', `/users/${user.id}/Bob`)
})
