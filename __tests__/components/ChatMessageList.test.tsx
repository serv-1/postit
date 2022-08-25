import { render, screen, waitFor } from '@testing-library/react'
import ChatMessageList from '../../components/ChatMessageList'
import getClientPusher from '../../utils/functions/getClientPusher'

jest.mock('../../utils/functions/getClientPusher')

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')
const axiosGet = jest.spyOn(require('axios'), 'get')
const axiosPut = jest.spyOn(require('axios'), 'put')

const messages = [
  { message: 'hi', createdAt: new Date(), userId: '0', seen: true },
  { message: 'hello', createdAt: new Date(), userId: '1', seen: true },
]
const JSONDiscussion = {
  id: '0',
  messages,
  postName: 'table',
  postId: '0',
  buyer: { id: '0', name: 'john', image: 'john.jpeg' },
  seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
  channelName: 'test',
}

const setToast = jest.fn()
const bind = jest.fn()
const unbind = jest.fn()

beforeEach(() => {
  Element.prototype.scroll = jest.fn()

  useToast.mockReturnValue({ setToast })
  useSession.mockReturnValue({ data: { id: '0' } })
  axiosGet.mockResolvedValue({ data: JSONDiscussion })
  axiosPut.mockResolvedValue({})

  const subscribe = () => ({ bind, unbind })
  ;(getClientPusher as jest.Mock).mockReturnValue({ subscribe })
})

it('renders', async () => {
  render(<ChatMessageList discussionId="0" csrfToken="token" />)

  const msg1 = await screen.findByText('hi')
  expect(msg1).toBeInTheDocument()

  const msg2 = screen.getByText('hello')
  expect(msg2).toBeInTheDocument()

  const images = screen.getAllByRole('img')
  expect(images[0]).toHaveAttribute('src', 'john.jpeg')
  expect(images[0].getAttribute('alt')).toContain('john')
  expect(images[1]).toHaveAttribute('src', 'jane.jpeg')
  expect(images[1].getAttribute('alt')).toContain('jane')

  const url = 'http://localhost:3000/api/discussions/0?csrfToken=token'
  expect(axiosGet).toHaveBeenNthCalledWith(1, url)

  expect(axiosPut).not.toHaveBeenCalled()
})

it('renders an alert if the server fails to fetch the discussion', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<ChatMessageList discussionId="0" csrfToken="token" />)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('scrolls until the last message of the discussion is visible', async () => {
  const { container } = render(
    <ChatMessageList discussionId="0" csrfToken="token" />
  )

  const msgList = container.firstElementChild as HTMLDivElement

  await waitFor(() => {
    const scrollOptions = { top: msgList.scrollHeight, behavior: 'smooth' }
    expect(msgList.scroll).toHaveBeenNthCalledWith(1, scrollOptions)
  })
})

it('updates the last unseen messages if the user has saw them', async () => {
  const msg = { ...messages[0], userId: '1', seen: false }

  axiosGet.mockResolvedValue({ data: { ...JSONDiscussion, messages: [msg] } })

  render(<ChatMessageList discussionId="0" csrfToken="token" />)

  await waitFor(() => {
    const url = 'http://localhost:3000/api/discussions/0'
    expect(axiosPut).toHaveBeenNthCalledWith(1, url, { csrfToken: 'token' })
  })
})

it('does not update the last message if its author is the signed in user', async () => {
  const msg = { ...messages[0], seen: false }
  axiosGet.mockResolvedValue({ data: { ...JSONDiscussion, messages: [msg] } })

  render(<ChatMessageList discussionId="0" csrfToken="token" />)

  await screen.findByText('hi')

  expect(axiosPut).not.toHaveBeenCalled()
})

it('renders an alert if the server fails to update the last unseen messages', async () => {
  const msg = { ...messages[0], userId: '1', seen: false }

  axiosGet.mockResolvedValue({ data: { ...JSONDiscussion, messages: [msg] } })
  axiosPut.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<ChatMessageList discussionId="0" csrfToken="token" />)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('renders the new message received in real time', async () => {
  const createdAt = new Date().toISOString()

  render(<ChatMessageList discussionId="0" csrfToken="token" />)

  await waitFor(() => {
    const newMessageHandler = bind.mock.calls[0][1]
    newMessageHandler({
      message: 'yo',
      createdAt,
      userId: '0',
      seen: false,
    })
  })

  const msg = await screen.findByText('yo')
  expect(msg).toBeInTheDocument()
})

it('unbinds all events when unmounting', async () => {
  const { unmount } = render(
    <ChatMessageList discussionId="0" csrfToken="token" />
  )

  await screen.findByText('hi')

  unmount()

  expect(unbind).toHaveBeenCalledTimes(1)
})
