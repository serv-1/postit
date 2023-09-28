import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatModal from '.'
// prettier-ignore
// @ts-expect-error
import { mockClientPusherBind, mockClientPusherUnbind } from 'utils/functions/getClientPusher'
import { setupServer } from 'msw/node'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'
import 'cross-fetch/polyfill'

const server = setupServer()

jest
  .mock('utils/functions/getClientPusher')
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast() {}, toast: {} }),
  }))
  .mock('next-auth/react', () => ({
    getCsrfToken: async () => 'token',
    useSession: () => ({ data: { id: '0', channelName: 'test' } }),
  }))

beforeEach(() => {
  Element.prototype.scroll = () => null
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('closes on click on the close button', async () => {
  server.use(...discussionsIdHandlers)

  const setIsOpen = jest.fn()

  render(<ChatModal isOpen={true} setIsOpen={setIsOpen} discussionId="0" />)

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(setIsOpen).toHaveBeenNthCalledWith(1, false)
})

it('dispatches a "chatOpen" custom event each time the modal is opened or closed', async () => {
  server.use(...discussionsIdHandlers)

  document.dispatchEvent = jest.fn()

  render(<ChatModal isOpen={true} setIsOpen={() => null} discussionId="0" />)

  await screen.findByText('yo')

  expect(document.dispatchEvent).toHaveBeenCalledTimes(1)
})

it('renders the newly created discussion in real time', async () => {
  server.use(...discussionsIdHandlers)

  render(
    <ChatModal
      isOpen={true}
      setIsOpen={() => null}
      postId="0"
      postName="table"
      sellerId="1"
    />
  )

  let msg = screen.queryByText('yo')

  expect(msg).not.toBeInTheDocument()

  await waitFor(() => {
    const discussionCreatedHandler = mockClientPusherBind.mock.calls[0][1]

    discussionCreatedHandler({ discussionId: '0', userId: '0' })
  })

  msg = await screen.findByText('yo')

  expect(msg).toBeInTheDocument()
})

it('stops rendering the discussion if it is deleted in real time', async () => {
  server.use(...discussionsIdHandlers)

  render(<ChatModal isOpen={true} setIsOpen={() => null} discussionId="0" />)

  let msg: HTMLElement | null = await screen.findByText('yo')

  expect(msg).toBeInTheDocument()

  await waitFor(() => {
    const discussionDeletedHandler = mockClientPusherBind.mock.calls[1][1]

    discussionDeletedHandler()
  })

  msg = screen.queryByText('yo')

  expect(msg).toBeInTheDocument()
})

it('does not render if it is closed', async () => {
  render(<ChatModal isOpen={false} setIsOpen={() => null} discussionId="0" />)

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
})

it('unbinds all events when unmounting', async () => {
  server.use(...discussionsIdHandlers)

  const { unmount } = render(
    <ChatModal isOpen={true} setIsOpen={() => null} discussionId="0" />
  )

  await waitFor(() => expect(mockClientPusherBind).toHaveBeenCalled())

  unmount()

  const { calls } = mockClientPusherUnbind.mock

  expect(calls[0][0]).toBe('discussion-created')
  expect(calls[1][0]).toBe('discussion-deleted')
})
