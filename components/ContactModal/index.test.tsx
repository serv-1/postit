import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactModal from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { act } from 'react-dom/test-utils'
import usePusher from 'hooks/usePusher'

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: () => null, toast: {} }),
  }))
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

const server = setupServer()
const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockUsePusher = usePusher as jest.MockedFunction<typeof usePusher>

beforeEach(() => {
  mockUseSession.mockReturnValue({
    status: 'authenticated',
    data: { channelName: 'test' },
  })

  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('opens/closes', async () => {
  render(<ContactModal postId="0" postName="table" sellerId="0" />)

  let modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(modal).not.toBeInTheDocument()
})

it("opens the discussion if it isn't hidden", async () => {
  render(
    <ContactModal discussionId="0" postId="1" postName="table" sellerId="2" />
  )

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
  expect(openDiscussionHandler).toHaveBeenCalledTimes(1)
})

it("doesn't open the discussion if it is hidden", async () => {
  render(
    <ContactModal
      discussionId="0"
      postId="1"
      postName="table"
      sellerId="2"
      isDiscussionHidden
    />
  )

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
  expect(openDiscussionHandler).not.toHaveBeenCalled()
})

it('closes the modal and opens the discussion on message sent', async () => {
  server.use(
    rest.post('http://localhost/api/discussion', (req, res, ctx) => {
      return res(ctx.status(201), ctx.json({ _id: '0' }))
    })
  )

  render(<ContactModal postId="0" postName="table" sellerId="0" />)

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'a')

  const sendBtn = screen.getByRole('button', { name: /send/i })
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(sendBtn)

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
  expect(openDiscussionHandler).toHaveBeenCalledTimes(1)

  await userEvent.click(openBtn)

  expect(openDiscussionHandler).toHaveBeenCalledTimes(2)
})

it("can't open the discussion if it has been deleted", async () => {
  render(
    <ContactModal discussionId="0" postId="1" postName="table" sellerId="2" />
  )

  act(() => {
    document.dispatchEvent(
      new CustomEvent('discussionDeleted', { detail: '0' })
    )
  })

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  expect(openDiscussionHandler).not.toHaveBeenCalled()
})

it('still can open the discussion if it is another discussion that has been deleted', async () => {
  render(
    <ContactModal discussionId="0" postId="1" postName="table" sellerId="2" />
  )

  act(() => {
    document.dispatchEvent(
      new CustomEvent('discussionDeleted', { detail: '6' })
    )
  })

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  expect(openDiscussionHandler).toHaveBeenCalledTimes(1)
})

it('can open the discussion if it has a new message', async () => {
  render(
    <ContactModal discussionId="0" postId="1" postName="table" sellerId="2" />
  )

  act(() => {
    mockUsePusher.mock.calls[0][2]({ discussionId: '0' })
  })

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  expect(openDiscussionHandler).toHaveBeenCalledTimes(1)
})

it("still can't open the discussion if it is another discussion that has a new message", async () => {
  render(
    <ContactModal
      discussionId="0"
      postId="1"
      postName="table"
      sellerId="2"
      isDiscussionHidden
    />
  )

  act(() => {
    mockUsePusher.mock.calls[0][2]({ discussionId: '6' })
  })

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  expect(openDiscussionHandler).not.toHaveBeenCalled()
})
