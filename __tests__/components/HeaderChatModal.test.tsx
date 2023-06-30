import HeaderChatModal from '../../components/HeaderChatModal'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import getClientPusher from '../../utils/functions/getClientPusher'
import { act } from 'react-dom/test-utils'
import { ChatModalProps } from '../../components/ChatModal'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('../../utils/functions/getClientPusher')
jest.mock('../../components/ChatModal', () => ({
  __esModule: true,
  default: ({ setIsOpen, isOpen }: ChatModalProps) =>
    isOpen && (
      <div role="dialog">
        <button onClick={() => setIsOpen(false)}>Close</button>
      </div>
    ),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const axiosGet = jest.spyOn(require('axios'), 'get')
const axiosPut = jest.spyOn(require('axios'), 'put')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

const setToast = jest.fn()
const bind = jest.fn()
const unbind = jest.fn()

const msg = {
  message: 'yo',
  createdAt: new Date().toISOString(),
  userId: '0',
  seen: false,
}
const JSONDiscussion = {
  id: '0',
  messages: [msg],
  postName: 'Table',
  postId: '0',
  buyer: { id: '0', name: 'john', image: 'john.jpeg' },
  seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
  channelName: 'test',
}

beforeEach(() => {
  axiosGet.mockResolvedValue({ data: JSONDiscussion })
  axiosPut.mockResolvedValue({})
  useToastMock.mockReturnValue({ setToast, toast: {} })
  useSession.mockReturnValue({ data: { id: '0' } })

  const subscribe = () => ({ bind, unbind })
  ;(getClientPusher as jest.Mock).mockReturnValue({ subscribe })
})

it('opens/closes', async () => {
  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

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

  const url = '/api/discussions/0?csrfToken=token'
  expect(axiosGet).toHaveBeenNthCalledWith(1, url)

  expect(bind).toHaveBeenCalledTimes(3)
})

it('renders a notification badge if there a new message', async () => {
  axiosGet.mockResolvedValue({
    data: { ...JSONDiscussion, messages: [{ ...msg, userId: '1' }] },
  })

  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  const notifBadge = await screen.findByRole('status')
  expect(notifBadge).toBeInTheDocument()
})

it('does not render a notification badge if there is no new message', async () => {
  axiosGet.mockResolvedValue({
    data: {
      ...JSONDiscussion,
      messages: [{ ...msg, userId: '1', seen: true }],
    },
  })

  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  await screen.findByRole('button', { name: /open/i })

  const notifBadge = screen.queryByRole('status')
  expect(notifBadge).not.toBeInTheDocument()
})

it('unmounts the notification badge if the modal is open', async () => {
  axiosGet.mockResolvedValue({
    data: { ...JSONDiscussion, messages: [{ ...msg, userId: '1' }] },
  })

  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  const notifBadge = await screen.findByRole('status')
  expect(notifBadge).toBeInTheDocument()

  const openBtn = screen.getByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  expect(notifBadge).not.toBeInTheDocument()
})

it('renders a notification badge if there is a new message received in real time', async () => {
  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  await waitFor(() => expect(bind).toHaveBeenCalledTimes(1))

  const newMessageHandler = bind.mock.calls[0][1]
  act(() => newMessageHandler())

  const notifBadge = screen.getByRole('status')
  expect(notifBadge).toBeInTheDocument()
})

it('does not render a notification badge if there is a new message but the modal is open', async () => {
  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  const openBtn = await screen.findByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  await waitFor(() => expect(bind).toHaveBeenCalledTimes(2))

  const newMessageHandler = bind.mock.calls[1][1]
  act(() => newMessageHandler())

  const notifBadge = screen.queryByRole('status')
  expect(notifBadge).not.toBeInTheDocument()
})

it('an alert renders if the server fails to fetch the discussion', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('unbinds the events when unmounting', async () => {
  const { unmount } = render(
    <HeaderChatModal discussionId="0" csrfToken="token" />
  )

  await waitFor(() => expect(bind).toHaveBeenCalledTimes(1))

  unmount()

  expect(unbind).toHaveBeenCalledTimes(1)
})
