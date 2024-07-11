import { render, screen, waitFor } from '@testing-library/react'
import DiscussionMessageList from '.'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import { rest } from 'msw'
import type { User } from 'types'
import type { DiscussionMessageProps } from 'components/DiscussionMessage'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockSetToast = jest.fn()
const server = setupServer()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('components/DiscussionMessage', () => ({
    __esModule: true,
    default: ({ message, author }: DiscussionMessageProps) => (
      <div>
        {message}
        <span>{author?.name}</span>
        <img src={author?.image} alt="" />
      </div>
    ),
  }))

beforeEach(() => {
  Element.prototype.scroll = jest.fn()

  mockUseSession.mockReturnValue({ data: { id: '0' } })
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const signedInUser: User = {
  _id: '1',
  name: 'john',
  image: 'john.jpg',
  email: 'john@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

const interlocutor: User = {
  _id: '2',
  name: 'jane',
  image: 'jane.jpg',
  email: 'jane@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

it('renders the messages', async () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          seen: true,
          userId: signedInUser._id,
        },
        {
          _id: '1',
          message: 'hi',
          createdAt: new Date().toString(),
          seen: true,
          userId: interlocutor._id,
        },
      ]}
    />
  )

  const messages = screen.getAllByRole('listitem')

  expect(messages).toHaveLength(2)
})

it('scrolls until the last message of the discussion is visible', async () => {
  const { container } = render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'hi',
          createdAt: new Date().toString(),
          userId: '0',
          seen: true,
        },
      ]}
    />
  )

  const msgList = container.firstElementChild!

  await waitFor(() => {
    expect(msgList.scroll).toHaveBeenNthCalledWith(1, {
      top: msgList.scrollHeight,
      behavior: 'smooth',
    })
  })
})

it('updates the last unseen message written by the other user', async () => {
  server.use(
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: signedInUser._id,
          seen: false,
        },
      ]}
    />
  )
})

it('renders an alert if the server fails to update the last unseen message', async () => {
  server.use(
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: signedInUser._id,
          seen: false,
        },
      ]}
    />
  )

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('renders the message with the signed in user as the author', () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: signedInUser._id,
          seen: true,
        },
      ]}
    />
  )

  const authorName = screen.getByText(signedInUser.name)

  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('img')

  expect(authorImage).toHaveAttribute('src', signedInUser.image)
})

it('renders the message with the interlocutor as the author', () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={interlocutor}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: interlocutor._id,
          seen: true,
        },
      ]}
    />
  )

  const authorName = screen.getByText(interlocutor.name)

  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('img')

  expect(authorImage).toHaveAttribute('src', interlocutor.image)
})

it('renders the message with its author deleted', () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: '3',
          seen: true,
        },
      ]}
    />
  )

  const authorName = screen.getByText('deleted')

  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('img')

  expect(authorImage).not.toHaveAttribute('src')
})
