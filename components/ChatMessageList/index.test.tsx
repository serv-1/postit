import { render, screen, waitFor } from '@testing-library/react'
import ChatMessageList from '.'
// prettier-ignore
// @ts-expect-error
import { mockClientPusherBind, mockClientPusherUnbind } from 'utils/functions/getClientPusher'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { setupServer } from 'msw/node'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'
import 'cross-fetch/polyfill'
import { rest } from 'msw'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockSetToast = jest.fn()
const server = setupServer()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('utils/functions/getClientPusher')

beforeEach(() => {
  Element.prototype.scroll = jest.fn()

  mockUseSession.mockReturnValue({ data: { id: '0' } })
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [
            { message: 'hi', createdAt: new Date(), userId: '0', seen: true },
            { message: 'yo', createdAt: new Date(), userId: '1', seen: true },
          ],
          buyer: { id: '0', name: 'john', image: 'john.jpeg' },
          seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
          channelName: 'test',
        })
      )
    })
  )

  render(<ChatMessageList discussionId="0" />)

  const msg1 = await screen.findByText('hi')

  expect(msg1).toBeInTheDocument()

  const msg2 = screen.getByText('yo')

  expect(msg2).toBeInTheDocument()

  const images = screen.getAllByRole('img')

  expect(images[0]).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.jpeg')
  expect(images[0].getAttribute('alt')).toContain('john')
  expect(images[1]).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/jane.jpeg')
  expect(images[1].getAttribute('alt')).toContain('jane')
})

it('renders an alert if the server fails to fetch the discussion', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<ChatMessageList discussionId="0" />)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('scrolls until the last message of the discussion is visible', async () => {
  server.use(...discussionsIdHandlers)

  const { container } = render(<ChatMessageList discussionId="0" />)

  const msgList = container.firstElementChild as HTMLDivElement

  await waitFor(() => {
    expect(msgList.scroll).toHaveBeenNthCalledWith(1, {
      top: msgList.scrollHeight,
      behavior: 'smooth',
    })
  })
})

it('updates the last unseen messages if the user has saw them', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [
            { message: 'hi', createdAt: new Date(), userId: '0', seen: true },
            { message: 'yo', createdAt: new Date(), userId: '1', seen: false },
          ],
          buyer: { id: '0', name: 'john', image: 'john.jpeg' },
          seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
          channelName: 'test',
        })
      )
    }),
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  render(<ChatMessageList discussionId="0" />)

  await screen.findByText('yo')
})

it('does not update the last message if its author is the signed in user', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [
            { message: 'hi', createdAt: new Date(), userId: '0', seen: false },
          ],
          buyer: { id: '0', name: 'john', image: 'john.jpeg' },
          seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
          channelName: 'test',
        })
      )
    })
  )

  render(<ChatMessageList discussionId="0" />)

  await screen.findByText('hi')
})

it('renders an alert if the server fails to update the last unseen messages', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({
          messages: [
            { message: 'hi', createdAt: new Date(), userId: '0', seen: true },
            { message: 'yo', createdAt: new Date(), userId: '1', seen: false },
          ],
          buyer: { id: '0', name: 'john', image: 'john.jpeg' },
          seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
          channelName: 'test',
        })
      )
    }),
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<ChatMessageList discussionId="0" />)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('renders the new message received in real time', async () => {
  server.use(...discussionsIdHandlers)

  render(<ChatMessageList discussionId="0" />)

  await waitFor(() => {
    const newMessageHandler = mockClientPusherBind.mock.calls[0][1]
    newMessageHandler({
      message: 'hi',
      createdAt: new Date().toISOString(),
      userId: '0',
      seen: false,
    })
  })

  const msg = await screen.findByText('hi')

  expect(msg).toBeInTheDocument()
})

it('unbinds all events when unmounting', async () => {
  server.use(...discussionsIdHandlers)

  const { unmount } = render(<ChatMessageList discussionId="0" />)

  await screen.findByText('yo')

  unmount()

  expect(mockClientPusherUnbind).toHaveBeenCalledTimes(1)
})
