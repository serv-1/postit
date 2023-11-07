import HeaderChatModal from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import type { ChatModalProps } from 'components/ChatModal'
// prettier-ignore
// @ts-expect-error
import { mockClientPusherBind, mockClientPusherUnbind } from 'functions/getClientPusher'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'
import { rest } from 'msw'
import 'cross-fetch/polyfill'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockSetToast = jest.fn()
const server = setupServer()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('functions/getClientPusher')
  .mock('components/ChatModal', () => ({
    __esModule: true,
    default: ({ setIsOpen, isOpen }: ChatModalProps) =>
      isOpen && (
        <div role="dialog">
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      ),
  }))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
  mockUseSession.mockReturnValue({ data: { id: '0' } })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('opens/closes', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [{ userId: '0', seen: false }],
          postName: 'table',
          buyer: { id: '0', name: 'john' },
          seller: { id: '1', name: 'jane' },
          channelName: 'test',
        })
      )
    })
  )

  render(<HeaderChatModal discussionId="0" />)

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()

  const openBtn = await screen.findByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()

  const interlocutorName = screen.getByText('jane')

  expect(interlocutorName).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(modal).not.toBeInTheDocument()
  expect(mockClientPusherBind).toHaveBeenCalledTimes(3)
})

it('renders a notification badge if there a new message', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [{ userId: '1', seen: false }],
          postName: 'table',
          buyer: { id: '0', name: 'john' },
          seller: { id: '1', name: 'jane' },
          channelName: 'test',
        })
      )
    })
  )

  render(<HeaderChatModal discussionId="0" />)

  const notifBadge = await screen.findByRole('status')

  expect(notifBadge).toBeInTheDocument()
})

it("doesn't render a notification badge if there is no new message", async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [{ userId: '1', seen: true }],
          postName: 'table',
          buyer: { id: '0', name: 'john' },
          seller: { id: '1', name: 'jane' },
          channelName: 'test',
        })
      )
    })
  )

  render(<HeaderChatModal discussionId="0" />)

  await screen.findByRole('button', { name: /open/i })

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()
})

it('unmounts the notification badge if the modal is open', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [{ userId: '1', seen: false }],
          postName: 'table',
          buyer: { id: '0', name: 'john' },
          seller: { id: '1', name: 'jane' },
          channelName: 'test',
        })
      )
    })
  )

  render(<HeaderChatModal discussionId="0" />)

  const notifBadge = await screen.findByRole('status')

  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  expect(notifBadge).not.toBeInTheDocument()
})

it('renders a notification badge if there is a new message received in real time', async () => {
  server.use(...discussionsIdHandlers)

  render(<HeaderChatModal discussionId="0" />)

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalledTimes(1))

  const newMessageHandler = mockClientPusherBind.mock.calls[0][1]

  act(() => newMessageHandler())

  const notifBadge = screen.getByRole('status')

  expect(notifBadge).toBeInTheDocument()
})

it("doesn't render a notification badge if there is a new message but the modal is open", async () => {
  server.use(...discussionsIdHandlers)

  render(<HeaderChatModal discussionId="0" />)

  const openBtn = await screen.findByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalledTimes(2))

  const newMessageHandler = mockClientPusherBind.mock.calls[1][1]

  act(() => newMessageHandler())

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()
})

it('renders an alert if the server fails to fetch the discussion', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<HeaderChatModal discussionId="0" />)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('unbinds the events when unmounting', async () => {
  server.use(...discussionsIdHandlers)

  const { unmount } = render(<HeaderChatModal discussionId="0" />)

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalledTimes(1))

  unmount()

  expect(mockClientPusherUnbind).toHaveBeenCalledTimes(1)
})
