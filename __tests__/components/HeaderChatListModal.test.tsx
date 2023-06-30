import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import HeaderChatListModal from '../../components/HeaderChatListModal'
import getClientPusher from '../../utils/functions/getClientPusher'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('../../utils/functions/getClientPusher')

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const axiosGet = jest.spyOn(require('axios'), 'get')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')
const getCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')

const setToast = jest.fn()
const bind = jest.fn()
const unbind = jest.fn()
const subscribe = jest.fn()

const discussion = {
  id: '0',
  messages: [{ message: 'yo', createdAt: new Date(), userId: '0', seen: true }],
  postName: 'table',
  postId: '0',
  buyer: { id: '0', name: 'john', image: 'john.jpeg' },
  seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
  channelName: 'test',
}
const user = {
  id: '0',
  name: 'Bob',
  email: 'bob@bob.bob',
  image: 'bob.jpeg',
  discussionsIds: [],
  posts: [],
  favPosts: [],
  channelName: 'test',
  hasUnseenMessages: false,
}

beforeEach(() => {
  axiosGet
    .mockResolvedValue({ data: discussion })
    .mockResolvedValueOnce({ data: user })

  useToastMock.mockReturnValue({ setToast, toast: {} })
  useSession.mockReturnValue({ data: { id: '0', channelName: 'test' } })
  getCsrfToken.mockResolvedValue('t')

  subscribe.mockImplementation(() => ({ bind, unbind }))
  ;(getClientPusher as jest.Mock).mockReturnValue({ subscribe })
})

it('opens/closes', async () => {
  render(<HeaderChatListModal />)

  expect(axiosGet.mock.calls[0][0]).toBe('/api/users/0')

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
  expect(axiosGet).toHaveBeenCalledTimes(1)
  expect(bind).toHaveBeenCalledTimes(9)
})

it('renders a notification badge if a discussion has been udpated', async () => {
  axiosGet
    .mockReset()
    .mockResolvedValue({ data: { ...user, hasUnseenMessages: true } })

  render(<HeaderChatListModal />)

  const notifBadge = await screen.findByRole('status')
  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button')
  expect(openBtn.className).toContain('red')
})

it('renders a notification badge if a discussion has been updated in real time', async () => {
  render(<HeaderChatListModal />)

  const newMessageHandler = bind.mock.calls[0][1]
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
  render(<HeaderChatListModal />)

  const discussionCreatedHandler = bind.mock.calls[1][1]
  act(() => discussionCreatedHandler({ discussion: '0', userId: '1' }))

  const notifBadge = await screen.findByRole('status')
  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()
})

it('does not render a notification badge if the discussion has been created by the signed in user', async () => {
  render(<HeaderChatListModal />)

  const discussionCreatedHandler = bind.mock.calls[1][1]
  act(() => discussionCreatedHandler({ discussionId: '0', userId: '0' }))

  const notifBadge = screen.queryByRole('status')
  expect(notifBadge).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')
  expect(openBtn.className).not.toContain('red')

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()
})

it('does not render a notification badge if the discussion has been updated but a chat modal is already open', async () => {
  render(<HeaderChatListModal />)

  document.dispatchEvent(new CustomEvent('chatOpen'))
  const newMessageHandler = bind.mock.calls[0][1]
  act(() => newMessageHandler())

  const notifBadge = screen.queryByRole('status')
  expect(notifBadge).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()
})

it('the open chat list button is not red if the discussion has been updated in real time but the modal is open', async () => {
  render(<HeaderChatListModal />)

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const newMessageHandler = bind.mock.calls[3][1]
  act(() => newMessageHandler())

  expect(openBtn.className).not.toContain('red')
})

it('unmounts the notification badge if the modal is open', async () => {
  axiosGet
    .mockReset()
    .mockResolvedValue({ data: { ...user, hasUnseenMessages: true } })

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
  axiosGet
    .mockReset()
    .mockResolvedValueOnce({ data: { ...user, discussionsIds: ['0'] } })
    .mockResolvedValue({ data: discussion })

  render(<HeaderChatListModal />)

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const discussionName = screen.getByText('table')
  expect(discussionName).toBeInTheDocument()

  const discussionDeletedHandler = bind.mock.calls[2][1]
  act(() => discussionDeletedHandler('0'))

  const noDiscussionText = screen.getByRole('status')
  expect(noDiscussionText).toBeInTheDocument()
  expect(discussionName).not.toBeInTheDocument()
})

it('renders an alert if the server fails to fetch the user', async () => {
  axiosGet
    .mockReset()
    .mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<HeaderChatListModal />)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('unbinds/removes all events when unmounting', async () => {
  document.removeEventListener = jest.fn()

  render(<HeaderChatListModal />).unmount()

  expect(unbind).toHaveBeenCalledTimes(3)
  expect(document.removeEventListener).toHaveBeenCalledTimes(1)
})
