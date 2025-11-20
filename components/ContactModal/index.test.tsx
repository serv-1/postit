import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactModal from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { act } from 'react'
import usePusher from 'hooks/usePusher'
// @ts-expect-error
import { mockUseSession, mockGetCsrfToken } from 'next-auth/react'

jest
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next-auth/react')

const server = setupServer()
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
    http.post('http://localhost/api/discussion', () => {
      return HttpResponse.json({ _id: '0' }, { status: 201 })
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

  await act(async () => {
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

  await act(async () => {
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

  await act(async () => {
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

  await act(async () => {
    mockUsePusher.mock.calls[0][2]({ discussionId: '6' })
  })

  const openBtn = screen.getByRole('button')
  const openDiscussionHandler = jest.fn()

  document.addEventListener('openDiscussion', openDiscussionHandler)

  await userEvent.click(openBtn)

  expect(openDiscussionHandler).not.toHaveBeenCalled()
})
