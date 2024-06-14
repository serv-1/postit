import type { Discussion, User } from 'types'
import HeaderDiscussions from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import usePusher from 'hooks/usePusher'
import fetchDiscussion from 'functions/fetchDiscussion'

const mockSetToast = jest.fn()
const mockUsePusher = usePusher as jest.MockedFunction<typeof usePusher>

const mockFetchDiscussion = fetchDiscussion as jest.MockedFunction<
  typeof fetchDiscussion
>

const user: User = {
  id: '0',
  name: 'john',
  email: 'john@test.com',
  discussions: [
    { id: '1', hidden: false, hasNewMessage: false },
    { id: '2', hidden: false, hasNewMessage: false },
  ],
  postIds: [],
  favPostIds: [],
  channelName: 'channelName',
}

const discussion: Discussion = {
  id: '1',
  postId: '0',
  postName: 'postName',
  channelName: 'channelName',
  messages: [
    {
      message: 'yo',
      createdAt: '',
      userId: '0',
      seen: true,
    },
  ],
  buyer: {
    id: '0',
    name: 'john',
    image: 'john.jpeg',
  },
  seller: {
    id: '1',
    name: 'bob',
    image: 'bob.jpeg',
  },
  hasNewMessage: false,
}

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

it("doesn't render the notification badge", () => {
  render(<HeaderDiscussions user={user} />)

  const badge = screen.queryByRole('status')

  expect(badge).not.toBeInTheDocument()
})

it('opens the "discussion list" modal by clicking on its open button', async () => {
  render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveClass('hidden')

  await userEvent.click(openBtn)

  expect(modal).not.toHaveClass('hidden')
})

it('closes the "discussion list" modal', async () => {
  render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

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
        .mockResolvedValueOnce({ ...discussion, id: '2' })

      render(
        <HeaderDiscussions
          user={{
            ...user,
            discussions: [
              { id: '1', hidden: false, hasNewMessage: false },
              { id: '2', hidden: true, hasNewMessage: false },
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
        .mockResolvedValueOnce({ ...discussion, id: '2' })

      render(<HeaderDiscussions user={user} />)

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

      render(<HeaderDiscussions user={user} />)

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
        .mockResolvedValueOnce({ ...discussion, id: '2' })

      render(
        <HeaderDiscussions
          user={{
            ...user,
            discussions: [
              { id: '1', hidden: false, hasNewMessage: false },
              { id: '2', hidden: true, hasNewMessage: false },
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
        .mockResolvedValueOnce({ ...discussion, id: '2' })
        .mockResolvedValueOnce({ ...discussion, id: '1' })

      render(<HeaderDiscussions user={user} />)

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

      render(<HeaderDiscussions user={user} />)

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

      render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

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
        .mockResolvedValueOnce({ ...discussion, id: '2' })
        .mockResolvedValueOnce({ ...discussion, id: '1' })

      render(<HeaderDiscussions user={user} />)

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

      render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

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
        .mockResolvedValueOnce({ ...discussion, id: '2' })

      render(<HeaderDiscussions user={user} />)

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      await screen.findByRole('list')

      const modals = screen.getAllByRole('dialog')

      expect(modals[0]).not.toHaveClass('hidden')
      expect(modals[1]).toBeInTheDocument()
      expect(modals[2]).toBeUndefined()
    })
  })
})

it('deletes a discussion from the discussion list on "discussionDeleted" event', async () => {
  mockFetchDiscussion
    .mockResolvedValueOnce(discussion)
    .mockResolvedValueOnce({ ...discussion, id: '2' })

  render(<HeaderDiscussions user={user} />)

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
      .mockResolvedValueOnce({ ...discussion, id: '2' })

    render(<HeaderDiscussions user={user} />)

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })

    await userEvent.click(openBtn)

    act(() => {
      mockUsePusher.mock.calls[4][2]({ ...discussion, id: '3' })
    })

    const discussions = screen.getAllByRole('listitem')

    expect(discussions).toHaveLength(3)
  })

  it("adds it to the discussion list with the user discussions if they haven't been fetched yet", async () => {
    mockFetchDiscussion
      .mockResolvedValueOnce(discussion)
      .mockResolvedValueOnce({ ...discussion, id: '2' })

    render(<HeaderDiscussions user={user} />)

    act(() => {
      mockUsePusher.mock.calls[0][2]({ ...discussion, id: '3' })
    })

    const discussions = await screen.findAllByRole('listitem')

    expect(discussions).toHaveLength(3)
  })

  it('renders the notification badge if the "discussion list" modal is hidden', async () => {
    render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

    act(() => {
      mockUsePusher.mock.calls[0][2](discussion)
    })

    const badge = await screen.findByRole('status')

    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the 'discussion list' modal isn't hidden", async () => {
    render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })

    await userEvent.click(openBtn)

    act(() => {
      mockUsePusher.mock.calls[4][2](discussion)
    })

    const badge = screen.queryByRole('status')

    expect(badge).not.toBeInTheDocument()
  })
})

describe('when receiving a new message in real time', () => {
  it('renders the notification badge if the "discussion list" modal is hidden', async () => {
    render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

    act(() => {
      mockUsePusher.mock.calls[1][2](null)
    })

    const badge = screen.getByRole('status')

    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the 'discussion list' modal isn't hidden", async () => {
    render(<HeaderDiscussions user={{ ...user, discussions: [] }} />)

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })

    await userEvent.click(openBtn)

    act(() => {
      mockUsePusher.mock.calls[3][2](null)
    })

    const badge = screen.queryByRole('status')

    expect(badge).not.toBeInTheDocument()
  })
})
