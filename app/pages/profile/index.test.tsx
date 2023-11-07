import Profile from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import userHandlers from 'app/api/user/mock'
import 'cross-fetch/polyfill'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSignOut = jest.spyOn(require('next-auth/react'), 'signOut')
const server = setupServer()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast() {}, toast: {} }),
  }))
  .mock('components/Header', () => ({
    __esModule: true,
    default: () => <header></header>,
  }))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders', () => {
  render(
    <Profile
      user={{
        id: '0',
        name: 'john doe',
        email: 'john@test.com',
        image: 'john.jpeg',
        posts: [],
        favPosts: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const title = screen.getByRole('heading', { level: 1 })

  expect(title).toHaveTextContent('john')

  const publicProfileLink = screen.getByRole('link', { name: /public/i })

  expect(publicProfileLink).toHaveAttribute('href', `/users/0/john-doe`)
})

it('signs the user out', async () => {
  render(
    <Profile
      user={{
        id: '0',
        name: 'john doe',
        email: 'john@test.com',
        image: 'john.jpeg',
        posts: [],
        favPosts: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const signOutLink = screen.getByRole('link', { name: /sign out/i })

  await userEvent.click(signOutLink)

  expect(mockSignOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
})

it('updates the user name if it has been changed', async () => {
  mockGetCsrfToken.mockResolvedValue('token')
  server.use(...userHandlers)

  render(
    <Profile
      user={{
        id: '0',
        name: 'john doe',
        email: 'john@test.com',
        image: 'john.jpeg',
        posts: [],
        favPosts: [],
        discussionIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      }}
    />
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'bob')

  const submitBtn = screen.getAllByRole('button', { name: /change/i })[0]

  await userEvent.click(submitBtn)

  await waitFor(() => {
    const userName = screen.getByRole('heading', { level: 1 })

    expect(userName).toHaveTextContent('bob')
  })

  const publicProfileLink = screen.getByRole('link', { name: /public/i })

  expect(publicProfileLink).toHaveAttribute('href', `/users/0/bob`)
})
