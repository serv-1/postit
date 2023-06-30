import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatModal from '../../components/ChatModal'
import server from '../../mocks/server'
import getClientPusher from '../../utils/functions/getClientPusher'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('../../utils/functions/getClientPusher')

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')
const axiosGet = jest.spyOn(require('axios'), 'get')

const bind = jest.fn()
const unbind = jest.fn()

const JSONDiscussion = {
  id: '0',
  postId: '0',
  postName: 'table',
  channelName: 'test',
  messages: [
    {
      message: 'hi',
      createdAt: new Date().toISOString(),
      userId: '0',
      seen: false,
    },
    {
      message: 'yo',
      createdAt: new Date().toISOString(),
      userId: '1',
      seen: false,
    },
  ],
  buyer: { id: '0', name: 'john', image: 'john.jpeg' },
  seller: { id: '1', name: 'jane', image: 'jane.jpeg' },
}

beforeEach(() => {
  Element.prototype.scroll = () => null

  useSession.mockReturnValue({ data: { id: '0', channelName: 'test' } })
  useToastMock.mockReturnValue({ setToast() {}, toast: {} })
  axiosGet.mockResolvedValue({ data: JSONDiscussion })

  const subscribe = () => ({ bind, unbind })
  ;(getClientPusher as jest.Mock).mockReturnValue({ subscribe })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('closes on click on the close button', async () => {
  const setIsOpen = jest.fn()

  render(
    <ChatModal
      isOpen={true}
      setIsOpen={setIsOpen}
      csrfToken="token"
      discussionId="0"
    />
  )

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  expect(setIsOpen).toHaveBeenNthCalledWith(1, false)
})

it('dispatches a "chatOpen" custom event each time the modal is opened or closed', async () => {
  document.dispatchEvent = jest.fn()

  render(
    <ChatModal
      isOpen={true}
      setIsOpen={() => null}
      csrfToken="token"
      discussionId="0"
    />
  )

  await screen.findByText('hi')

  expect(document.dispatchEvent).toHaveBeenCalledTimes(1)
})

it('renders the newly created discussion in real time', async () => {
  render(
    <ChatModal
      isOpen={true}
      setIsOpen={() => null}
      csrfToken="token"
      postId="0"
      postName="table"
      sellerId="1"
    />
  )

  let msg = screen.queryByText('hi')
  expect(msg).not.toBeInTheDocument()

  await waitFor(() => {
    const discussionCreatedHandler = bind.mock.calls[0][1]
    discussionCreatedHandler({ discussionId: '0', userId: '0' })
  })

  msg = await screen.findByText('hi')
  expect(msg).toBeInTheDocument()
})

it('stops rendering the discussion if it is deleted in real time', async () => {
  render(
    <ChatModal
      isOpen={true}
      setIsOpen={() => null}
      csrfToken="token"
      discussionId="0"
    />
  )

  let msg: HTMLElement | null = await screen.findByText('hi')
  expect(msg).toBeInTheDocument()

  await waitFor(() => {
    const discussionDeletedHandler = bind.mock.calls[1][1]
    discussionDeletedHandler()
  })

  msg = screen.queryByText('hi')
  expect(msg).toBeInTheDocument()
})

it('does not render if it is closed', async () => {
  render(
    <ChatModal
      isOpen={false}
      setIsOpen={() => null}
      csrfToken="token"
      discussionId="0"
    />
  )

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})

it('unbinds all events when unmounting', async () => {
  const { unmount } = render(
    <ChatModal
      isOpen={true}
      setIsOpen={() => null}
      csrfToken="token"
      discussionId="0"
    />
  )

  await waitFor(() => expect(bind).toHaveBeenCalled())

  unmount()

  expect(unbind).toHaveBeenCalledTimes(2)
})
