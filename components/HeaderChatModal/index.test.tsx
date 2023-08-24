import HeaderChatModal from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { ChatModalProps } from 'components/ChatModal'
// prettier-ignore
// @ts-expect-error
import { mockClientPusherBind, mockClientPusherUnbind } from 'utils/functions/getClientPusher'

const mockSetToast = jest.fn()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('utils/functions/getClientPusher')
  .mock('components/ChatModal', () => ({
    __esModule: true,
    default: ({ setIsOpen, isOpen }: ChatModalProps) =>
      isOpen && (
        <div role="dialog">
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      ),
  }))

const axiosGet = jest.spyOn(require('axios'), 'get')
const axiosPut = jest.spyOn(require('axios'), 'put')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

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
  useSession.mockReturnValue({ data: { id: '0' } })
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

  expect(mockClientPusherBind).toHaveBeenCalledTimes(3)
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

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalledTimes(1))

  const newMessageHandler = mockClientPusherBind.mock.calls[0][1]
  act(() => newMessageHandler())

  const notifBadge = screen.getByRole('status')
  expect(notifBadge).toBeInTheDocument()
})

it('does not render a notification badge if there is a new message but the modal is open', async () => {
  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  const openBtn = await screen.findByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalledTimes(2))

  const newMessageHandler = mockClientPusherBind.mock.calls[1][1]
  act(() => newMessageHandler())

  const notifBadge = screen.queryByRole('status')
  expect(notifBadge).not.toBeInTheDocument()
})

it('an alert renders if the server fails to fetch the discussion', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<HeaderChatModal discussionId="0" csrfToken="token" />)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(mockSetToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('unbinds the events when unmounting', async () => {
  const { unmount } = render(
    <HeaderChatModal discussionId="0" csrfToken="token" />
  )

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalledTimes(1))

  unmount()

  expect(mockClientPusherUnbind).toHaveBeenCalledTimes(1)
})
