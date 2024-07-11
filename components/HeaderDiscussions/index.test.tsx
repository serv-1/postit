import type { Discussion, User } from 'types'
import HeaderDiscussions from '.'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import usePusher from 'hooks/usePusher'
import fetchDiscussion from 'functions/fetchDiscussion'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import usersIdHandlers from 'app/api/users/[id]/mock'

const mockSetToast = jest.fn()
const mockUsePusher = usePusher as jest.MockedFunction<typeof usePusher>

const mockFetchDiscussion = fetchDiscussion as jest.MockedFunction<
  typeof fetchDiscussion
>

const signedInUser: User = {
  _id: '0',
  name: 'john',
  email: 'john@test.com',
  discussions: [
    { _id: '0', id: '1', hidden: false, hasNewMessage: false },
    { _id: '1', id: '2', hidden: false, hasNewMessage: false },
  ],
  postIds: [],
  favPostIds: [],
  channelName: 'channelName',
}

const discussion: Discussion = {
  _id: '1',
  postId: '0',
  postName: 'postName',
  channelName: 'channelName',
  messages: [
    { _id: '0', message: 'yo', createdAt: '', userId: '0', seen: true },
  ],
  buyerId: '0',
  sellerId: '1',
  hasNewMessage: false,
}

const server = setupServer(...usersIdHandlers)

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next-auth/react', () => ({
    useSession: () => ({ data: { id: '0' } }),
    getCsrfToken: async () => 'token',
  }))
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('functions/fetchDiscussion', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

beforeEach(() => {
  Element.prototype.scroll = () => null
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("doesn't render the notification badge", () => {
  render(<HeaderDiscussions signedInUser={signedInUser} />)

  const badge = screen.queryByRole('status', { name: /new message/i })

  expect(badge).not.toBeInTheDocument()
})

it('opens the "discussion list" modal by clicking on its open button', async () => {
  render(
    <HeaderDiscussions signedInUser={{ ...signedInUser, discussions: [] }} />
  )

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('hidden')

  await userEvent.click(openBtn)

  expect(modal).not.toHaveClass('hidden')
})

it('closes the "discussion list" modal', async () => {
  render(
    <HeaderDiscussions signedInUser={{ ...signedInUser, discussions: [] }} />
  )

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })

  await userEvent.click(openBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('hidden')
})

describe('when the "discussion list" modal opens', () => {
  describe('by clicking on its open button', () => {
    it("fetches the discussions that aren't hidden", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      render(
        <HeaderDiscussions
          signedInUser={{
            ...signedInUser,
            discussions: [
              { _id: '0', id: '1', hidden: false, hasNewMessage: false },
              { _id: '1', id: '2', hidden: true, hasNewMessage: false },
            ],
          }}
        />
      )

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })

      await userEvent.click(openBtn)

      const discussions = await screen.findAllByRole('listitem')

      expect(discussions).toHaveLength(1)
    })

    it("doesn't fetch the discussions if they have already been fetched", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      render(<HeaderDiscussions signedInUser={signedInUser} />)

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })

      await userEvent.click(openBtn)
      await screen.findByRole('list')

      const closeBtn = screen.getByRole('button', { name: /close/i })

      await userEvent.click(closeBtn)
      await userEvent.click(openBtn)

      expect(mockFetchDiscussion).toHaveBeenCalledTimes(2)
    })

    it('renders an error if the server fails to fetch the discussions', async () => {
      mockFetchDiscussion.mockRejectedValueOnce(new Error('error'))

      render(<HeaderDiscussions signedInUser={signedInUser} />)

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })

      await userEvent.click(openBtn)

      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  describe('on "openDiscussion" event', () => {
    it("fetches the discussions that aren't hidden", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      render(
        <HeaderDiscussions
          signedInUser={{
            ...signedInUser,
            discussions: [
              { _id: '0', id: '1', hidden: false, hasNewMessage: false },
              { _id: '1', id: '2', hidden: true, hasNewMessage: false },
            ],
          }}
        />
      )

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      const discussions = await screen.findAllByRole('listitem')

      expect(discussions).toHaveLength(1)
    })

    it("doesn't fetch the discussions if they have already been fetched", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce({ ...discussion, _id: '2' })
        .mockResolvedValueOnce({ ...discussion, _id: '1' })

      render(<HeaderDiscussions signedInUser={signedInUser} />)

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await waitFor(() => {
        expect(screen.getAllByRole('dialog')).toHaveLength(2)
      })

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await waitFor(() => {
        expect(screen.getAllByRole('dialog')).toHaveLength(2)
      })

      expect(mockFetchDiscussion).toHaveBeenCalledTimes(2)
    })

    it('renders an error if the server fails to fetch the discussions', async () => {
      mockFetchDiscussion.mockRejectedValueOnce(new Error('error'))

      render(<HeaderDiscussions signedInUser={signedInUser} />)

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })

      await userEvent.click(openBtn)

      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })

    it("fetches the discussion to open if it isn't in the discussion list", async () => {
      mockFetchDiscussion.mockResolvedValueOnce(discussion)

      render(
        <HeaderDiscussions
          signedInUser={{ ...signedInUser, discussions: [] }}
        />
      )

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await waitFor(() => {
        expect(mockFetchDiscussion).toHaveBeenCalledTimes(1)
      })
    })

    it("doesn't fetch the discussion to open if it is in the discussion list", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce({ ...discussion, _id: '2' })
        .mockResolvedValueOnce({ ...discussion, _id: '1' })

      render(<HeaderDiscussions signedInUser={signedInUser} />)

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await waitFor(() => {
        expect(screen.getAllByRole('dialog')).toHaveLength(2)
      })

      expect(mockFetchDiscussion).not.toHaveBeenCalledTimes(3)
    })

    it('renders an error if the server fails to fetch the discussion to open', async () => {
      mockFetchDiscussion.mockRejectedValueOnce(new Error('error'))

      render(
        <HeaderDiscussions
          signedInUser={{ ...signedInUser, discussions: [] }}
        />
      )

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await waitFor(() => {
        expect(mockSetToast).toHaveBeenNthCalledWith(1, {
          message: 'error',
          error: true,
        })
      })
    })

    it('opens the "discussion list" modal and the modal of the discussion to open', async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      render(<HeaderDiscussions signedInUser={signedInUser} />)

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await screen.findByRole('list')

      const discussionListModal = screen.getByRole('dialog')

      expect(discussionListModal).not.toHaveClass('hidden')

      // discussion loading spinner
      await waitForElementToBeRemoved(() => screen.getAllByRole('status'))

      const discussionModals = screen.getAllByRole('dialog')

      expect(discussionModals[1]).toBeInTheDocument()
      expect(discussionModals[2]).toBeUndefined()
    })
  })
})

it('deletes a discussion from the discussion list on "discussionDeleted" event', async () => {
  mockFetchDiscussion
    .mockResolvedValueOnce(discussion)
    .mockResolvedValueOnce({ ...discussion, _id: '2' })

  render(<HeaderDiscussions signedInUser={signedInUser} />)

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })

  await userEvent.click(openBtn)
  await screen.findByRole('list')

  const discussions = screen.getAllByRole('listitem')

  expect(discussions).toHaveLength(2)

  act(() => {
    document.dispatchEvent(
      new CustomEvent('discussionDeleted', { detail: '1' })
    )
  })

  expect(discussions[0]).not.toBeInTheDocument()
  expect(discussions[1]).toBeInTheDocument()
})

describe('when receiving a new discussion in real time', () => {
  it('adds it to the discussion list', async () => {
    mockFetchDiscussion
      .mockResolvedValueOnce(discussion)
      .mockResolvedValueOnce({ ...discussion, _id: '2' })

    render(<HeaderDiscussions signedInUser={signedInUser} />)

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })

    await userEvent.click(openBtn)

    act(() => {
      mockUsePusher.mock.calls[4][2]({ ...discussion, _id: '3' })
    })

    const discussions = screen.getAllByRole('listitem')

    expect(discussions).toHaveLength(3)
  })

  it("adds it to the discussion list with the user discussions if they haven't been fetched yet", async () => {
    mockFetchDiscussion
      .mockResolvedValueOnce(discussion)
      .mockResolvedValueOnce({ ...discussion, _id: '2' })

    render(<HeaderDiscussions signedInUser={signedInUser} />)

    act(() => {
      mockUsePusher.mock.calls[0][2]({ ...discussion, _id: '3' })
    })

    const discussions = await screen.findAllByRole('listitem')

    expect(discussions).toHaveLength(3)
  })

  it('renders the notification badge if the "discussion list" modal is hidden', async () => {
    render(
      <HeaderDiscussions signedInUser={{ ...signedInUser, discussions: [] }} />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2](discussion)
    })

    const badge = await screen.findByRole('status', { name: /new message/i })

    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the 'discussion list' modal isn't hidden", async () => {
    render(
      <HeaderDiscussions signedInUser={{ ...signedInUser, discussions: [] }} />
    )

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })

    await userEvent.click(openBtn)

    act(() => {
      mockUsePusher.mock.calls[4][2](discussion)
    })

    const badge = screen.queryByRole('status', { name: /new message/i })

    expect(badge).not.toBeInTheDocument()
  })
})

describe('when receiving a new message in real time', () => {
  it('renders the notification badge if the "discussion list" modal is hidden', async () => {
    render(
      <HeaderDiscussions signedInUser={{ ...signedInUser, discussions: [] }} />
    )

    act(() => {
      mockUsePusher.mock.calls[1][2](null)
    })

    const badge = screen.getByRole('status', { name: /new message/i })

    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the 'discussion list' modal isn't hidden", async () => {
    render(
      <HeaderDiscussions signedInUser={{ ...signedInUser, discussions: [] }} />
    )

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })

    await userEvent.click(openBtn)

    act(() => {
      mockUsePusher.mock.calls[3][2](null)
    })

    const badge = screen.queryByRole('status', { name: /new message/i })

    expect(badge).not.toBeInTheDocument()
  })
})
