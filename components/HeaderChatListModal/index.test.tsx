import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import HeaderChatListModal from '.'
// prettier-ignore
// @ts-expect-error
import { mockClientPusherBind, mockClientPusherUnbind } from 'functions/getClientPusher'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import usersIdHandlers from 'app/api/users/[id]/mock'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'

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

beforeEach(() => {
  mockUseSession.mockReturnValue({ data: { id: '0', channelName: 'test' } })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('opens/closes', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({ discussionIds: [], hasUnseenMessages: false })
      )
    })
  )

  render(<HeaderChatListModal />)

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  expect(openBtn.className).toContain('fuchsia')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(modal).not.toBeInTheDocument()
  expect(mockClientPusherBind).toHaveBeenCalledTimes(9)
})

it('renders a notification badge if a discussion has been udpated', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({ discussionIds: [], hasUnseenMessages: true })
      )
    })
  )

  render(<HeaderChatListModal />)

  const notifBadge = await screen.findByRole('status')

  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  expect(openBtn.className).toContain('red')
})

it('renders a notification badge if a discussion has been updated in real time', async () => {
  server.use(...usersIdHandlers)

  render(<HeaderChatListModal />)

  const newMessageHandler = mockClientPusherBind.mock.calls[0][1]
  act(() => newMessageHandler())

  const notifBadge = await screen.findByRole('status')
  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button')
  expect(openBtn.className).toContain('red')

  await userEvent.click(openBtn)

  const modal = await screen.findByRole('dialog')
  expect(modal).toBeInTheDocument()
})

it('renders a notification badge if a discussion has been created in real time', async () => {
  server.use(...usersIdHandlers)

  render(<HeaderChatListModal />)

  const discussionCreatedHandler = mockClientPusherBind.mock.calls[1][1]

  act(() => discussionCreatedHandler({ discussionId: '0', userId: '1' }))

  const notifBadge = await screen.findByRole('status')

  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
})

it("doesn' t render a notification badge if the discussion has been created by the signed in user", async () => {
  server.use(...usersIdHandlers)

  render(<HeaderChatListModal />)

  const discussionCreatedHandler = mockClientPusherBind.mock.calls[1][1]

  act(() => discussionCreatedHandler({ discussionId: '0', userId: '0' }))

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  expect(openBtn.className).not.toContain('red')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
})

it("doesn't render a notification badge if the discussion has been updated but a chat modal is already open", async () => {
  server.use(...usersIdHandlers)

  render(<HeaderChatListModal />)

  document.dispatchEvent(new CustomEvent('chatOpen'))

  const newMessageHandler = mockClientPusherBind.mock.calls[0][1]

  act(() => newMessageHandler())

  const notifBadge = screen.queryByRole('status')

  expect(notifBadge).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
})

test("the open chat list button isn't red if the discussion has been updated in real time but the modal is open", async () => {
  server.use(...usersIdHandlers)

  render(<HeaderChatListModal />)

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const newMessageHandler = mockClientPusherBind.mock.calls[3][1]

  act(() => newMessageHandler())

  expect(openBtn.className).not.toContain('red')
})

it('unmounts the notification badge if the modal is open', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({ discussionIds: [], hasUnseenMessages: true })
      )
    })
  )

  render(<HeaderChatListModal />)

  const notifBadge = await screen.findByRole('status')

  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
  expect(notifBadge).not.toBeInTheDocument()
})

it('deletes the discussion in real time', async () => {
  mockGetCsrfToken.mockResolvedValue('token')

  server.use(
    ...discussionsIdHandlers,
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(
        ctx.status(200),
        ctx.json({ discussionIds: ['0'], hasUnseenMessages: false })
      )
    })
  )

  render(<HeaderChatListModal />)

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const discussionName = screen.getByText('table')

  expect(discussionName).toBeInTheDocument()

  const discussionDeletedHandler = mockClientPusherBind.mock.calls[2][1]

  act(() => discussionDeletedHandler('0'))

  const noDiscussionText = screen.getByRole('status')

  expect(noDiscussionText).toBeInTheDocument()
  expect(discussionName).not.toBeInTheDocument()
})

it('renders an alert if the server fails to fetch the user', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<HeaderChatListModal />)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('unbinds/removes all events when unmounting', async () => {
  server.use(...usersIdHandlers)

  document.removeEventListener = jest.fn()

  render(<HeaderChatListModal />).unmount()

  expect(mockClientPusherUnbind).toHaveBeenCalledTimes(3)
  expect(document.removeEventListener).toHaveBeenCalledTimes(1)
})
