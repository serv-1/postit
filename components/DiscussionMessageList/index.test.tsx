import { render, screen, waitFor } from '@testing-library/react'
import DiscussionMessageList from '.'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import { rest } from 'msw'

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
    default: ({ isLeftAligned }: { isLeftAligned: boolean }) => {
      return <div data-left-aligned={isLeftAligned}></div>
    },
  }))

beforeEach(() => {
  Element.prototype.scroll = jest.fn()

  mockUseSession.mockReturnValue({ data: { id: '0' } })
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders the messages', async () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      messages={[
        {
          message: 'yo',
          createdAt: new Date().toString(),
          seen: true,
          userId: '1',
          authorName: 'john',
        },
        {
          message: 'hi',
          createdAt: new Date().toString(),
          seen: true,
          userId: '2',
          authorName: 'bob',
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
      messages={[
        {
          message: 'hi',
          createdAt: new Date().toString(),
          userId: '0',
          seen: true,
          authorName: 'john',
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
      messages={[
        {
          message: 'yo',
          createdAt: new Date().toString(),
          userId: '1',
          seen: false,
          authorName: 'john',
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
      messages={[
        {
          message: 'yo',
          createdAt: new Date().toString(),
          userId: '1',
          seen: false,
          authorName: 'john',
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

it("renders a message aligned to the left if its author isn't the authenticated user", async () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      messages={[
        {
          message: 'yo',
          createdAt: new Date().toString(),
          userId: '1',
          seen: true,
          authorName: 'john',
        },
      ]}
    />
  )

  const message = screen.getByRole('listitem').firstElementChild!

  expect(message).toHaveAttribute('data-left-aligned', 'true')
})

it('renders a message aligned to the right if its author is the authenticated user', async () => {
  render(
    <DiscussionMessageList
      discussionId="0"
      messages={[
        {
          message: 'yo',
          createdAt: new Date().toString(),
          userId: '0',
          seen: true,
          authorName: 'john',
        },
      ]}
    />
  )

  const message = screen.getByRole('listitem').firstElementChild!

  expect(message).toHaveAttribute('data-left-aligned', 'false')
})
