import type { Discussion, User } from 'types'
import HeaderDiscussionListModal from '.'
import { screen } from '@testing-library/react'
import { act } from 'react'
import usePusher from 'hooks/usePusher'
import fetchDiscussion from 'functions/fetchDiscussion'
import { setupServer } from 'msw/node'
import usersIdHandlers from 'app/api/users/[id]/mock'
import Toast from 'components/Toast'
import setup from 'functions/setup'
import type { DiscussionModalProps } from 'components/DiscussionModal'

const mockUsePusher = vi.mocked(usePusher)
const mockFetchDiscussion = vi.mocked(fetchDiscussion)

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
const session = { id: '0', channelName: 'chan0', expires: '' }

vi.mock(import('next-auth/react'), () => ({
  useSession: () => ({
    data: session,
    update: async () => session,
    status: 'authenticated',
  }),
  getCsrfToken: async () => 'token',
}))

vi.mock('hooks/usePusher', () => ({
  default: vi.fn(),
}))

vi.mock('functions/fetchDiscussion', () => ({
  default: vi.fn(),
}))

vi.mock('next/image')

vi.mock('components/DiscussionModal', () => ({
  default: ({ isOpen }: DiscussionModalProps) => (
    <div role="dialog">{isOpen ? 'open' : 'closed'}</div>
  ),
}))

beforeEach(() => {
  Element.prototype.scroll = () => null
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("doesn't render the notification badge", () => {
  setup(<HeaderDiscussionListModal signedInUser={signedInUser} />)

  const badge = screen.queryByRole('status', { name: /new message/i })
  expect(badge).not.toBeInTheDocument()
})

it('opens by clicking on its open button', async () => {
  const { user } = setup(
    <HeaderDiscussionListModal
      signedInUser={{ ...signedInUser, discussions: [] }}
    />,
  )

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveClass('hidden')

  await user.click(openBtn)

  expect(modal).not.toHaveClass('hidden')
})

it('closes', async () => {
  const { user } = setup(
    <HeaderDiscussionListModal
      signedInUser={{ ...signedInUser, discussions: [] }}
    />,
  )

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })
  await user.click(openBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await user.click(closeBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveClass('hidden')
})

it('renders a loading indicator while fetching the discussions', () => {
  setup(<HeaderDiscussionListModal signedInUser={signedInUser} />)

  const loadingIndicator = screen.getByText(/loading/i)
  expect(loadingIndicator).toBeInTheDocument()
})

it('renders an informative text if there is no discussion', async () => {
  const { user } = setup(
    <HeaderDiscussionListModal
      signedInUser={{ ...signedInUser, discussions: [] }}
    />,
  )

  const openBtn = screen.getByRole('button', { name: /open/i })
  await user.click(openBtn)

  const text = screen.getByRole('paragraph')
  expect(text).toBeInTheDocument()
})

describe('when it opens', () => {
  describe('by clicking on its open button', () => {
    it('unmounts the notification badge', async () => {
      mockFetchDiscussion.mockResolvedValueOnce({
        ...discussion,
        hasNewMessage: true,
      })

      const { user } = setup(
        <HeaderDiscussionListModal
          signedInUser={{
            ...signedInUser,
            discussions: [
              { _id: '0', id: '1', hidden: false, hasNewMessage: true },
            ],
          }}
        />,
      )

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })
      await user.click(openBtn)

      const badge = screen.queryByRole('status', { name: /new message/i })
      expect(badge).not.toBeInTheDocument()
    })

    it('fetches the discussions not hidden', async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      const { user } = setup(
        <HeaderDiscussionListModal
          signedInUser={{
            ...signedInUser,
            discussions: [
              { _id: '0', id: '1', hidden: false, hasNewMessage: false },
              { _id: '1', id: '2', hidden: true, hasNewMessage: false },
            ],
          }}
        />,
      )

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })
      await user.click(openBtn)

      const discussions = await screen.findAllByRole('listitem')
      expect(discussions).toHaveLength(1)
    })

    it("doesn't re-fetch the discussions", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      const { user } = setup(
        <HeaderDiscussionListModal signedInUser={signedInUser} />,
      )

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })
      await user.click(openBtn)

      await screen.findByRole('list')

      const closeBtn = screen.getByRole('button', { name: /close/i })
      await user.click(closeBtn)

      await user.click(openBtn)

      expect(mockFetchDiscussion).toHaveBeenCalledTimes(2)
    })

    it('renders an error if the server fails to fetch the discussions', async () => {
      mockFetchDiscussion.mockRejectedValueOnce(new Error('error'))

      const { user } = setup(
        <>
          <Toast />
          <HeaderDiscussionListModal signedInUser={signedInUser} />
        </>,
      )

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })
      await user.click(openBtn)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveTextContent('error')
    })
  })

  describe('on "openDiscussion" event', () => {
    it('unmounts the notification badge', async () => {
      mockFetchDiscussion.mockResolvedValueOnce({
        ...discussion,
        hasNewMessage: true,
      })

      setup(
        <HeaderDiscussionListModal
          signedInUser={{
            ...signedInUser,
            discussions: [
              { _id: '0', id: '1', hidden: false, hasNewMessage: true },
            ],
          }}
        />,
      )

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      const badge = screen.queryByRole('status', { name: /new message/i })
      expect(badge).not.toBeInTheDocument()
    })

    it('fetches the discussions not hidden', async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      setup(
        <HeaderDiscussionListModal
          signedInUser={{
            ...signedInUser,
            discussions: [
              { _id: '0', id: '1', hidden: false, hasNewMessage: false },
              { _id: '1', id: '2', hidden: true, hasNewMessage: false },
            ],
          }}
        />,
      )

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      const discussions = screen.getAllByRole('listitem')
      expect(discussions).toHaveLength(1)
    })

    it("doesn't re-fetch the discussions", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce({ ...discussion, _id: '2' })
        .mockResolvedValueOnce({ ...discussion, _id: '1' })

      setup(<HeaderDiscussionListModal signedInUser={signedInUser} />)

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      let discussions = screen.getAllByRole('listitem')
      expect(discussions).toHaveLength(2)

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      discussions = screen.getAllByRole('listitem')
      expect(discussions).toHaveLength(2)
    })

    it('renders an error if the server fails to fetch the discussions', async () => {
      mockFetchDiscussion.mockRejectedValueOnce(new Error('error'))

      const { user } = setup(
        <>
          <Toast />
          <HeaderDiscussionListModal signedInUser={signedInUser} />
        </>,
      )

      const openBtn = screen.getByRole('button', {
        name: /open discussion list/i,
      })
      await user.click(openBtn)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveTextContent('error')
    })

    it("fetches the discussion to open if it isn't in the discussion list", async () => {
      mockFetchDiscussion.mockResolvedValueOnce(discussion)

      setup(
        <HeaderDiscussionListModal
          signedInUser={{ ...signedInUser, discussions: [] }}
        />,
      )

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      const discussions = screen.getAllByRole('listitem')
      expect(discussions).toHaveLength(1)
    })

    it("doesn't fetch the discussion to open if it is in the discussion list", async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce({ ...discussion, _id: '2' })
        .mockResolvedValueOnce({ ...discussion, _id: '1' })

      setup(<HeaderDiscussionListModal signedInUser={signedInUser} />)

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      expect(mockFetchDiscussion).not.toHaveBeenCalledTimes(3)
    })

    it('renders an error if the server fails to fetch the discussion to open', async () => {
      mockFetchDiscussion.mockRejectedValueOnce(new Error('error'))

      setup(
        <>
          <Toast />
          <HeaderDiscussionListModal
            signedInUser={{ ...signedInUser, discussions: [] }}
          />
        </>,
      )

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      const toast = screen.getByRole('alert')
      expect(toast).toHaveTextContent('error')
    })

    it('opens the discussion modal', async () => {
      mockFetchDiscussion
        .mockResolvedValueOnce(discussion)
        .mockResolvedValueOnce({ ...discussion, _id: '2' })

      setup(<HeaderDiscussionListModal signedInUser={signedInUser} />)

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      const discussionModals = screen.getAllByRole('dialog')

      expect(discussionModals[0]).not.toHaveClass('hidden')
      expect(discussionModals[1]).toHaveTextContent('open')
      expect(discussionModals[2]).toHaveTextContent('closed')
    })
  })
})

it('deletes a discussion from the discussion list on "discussionDeleted" event', async () => {
  mockFetchDiscussion
    .mockResolvedValueOnce(discussion)
    .mockResolvedValueOnce({ ...discussion, _id: '2' })

  const { user } = setup(
    <HeaderDiscussionListModal signedInUser={signedInUser} />,
  )

  const openBtn = screen.getByRole('button', {
    name: /open discussion list/i,
  })
  await user.click(openBtn)

  await screen.findByRole('list')

  const discussions = screen.getAllByRole('listitem')
  expect(discussions).toHaveLength(2)

  await act(async () => {
    document.dispatchEvent(
      new CustomEvent('discussionDeleted', { detail: '1' }),
    )
  })

  expect(discussions[0]).not.toBeInTheDocument()
  expect(discussions[1]).toBeInTheDocument()
})

describe('when receiving a new discussion in real time', () => {
  it('initializes the discussion list with the new discussion', async () => {
    const { user } = setup(
      <HeaderDiscussionListModal
        signedInUser={{ ...signedInUser, discussions: [] }}
      />,
    )

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })
    await user.click(openBtn)

    await act(async () => {
      mockUsePusher.mock.calls[4][2]({ ...discussion, _id: '0' })
    })

    const discussions = screen.getAllByRole('listitem')
    expect(discussions).toHaveLength(1)
  })

  it('adds the new discussion to the discussion list', async () => {
    mockFetchDiscussion
      .mockResolvedValueOnce(discussion)
      .mockResolvedValueOnce({ ...discussion, _id: '2' })

    const { user } = setup(
      <HeaderDiscussionListModal signedInUser={{ ...signedInUser }} />,
    )

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })
    await user.click(openBtn)

    await act(async () => {
      mockUsePusher.mock.calls[4][2]({ ...discussion, _id: '3' })
    })

    const discussions = screen.getAllByRole('listitem')
    expect(discussions).toHaveLength(3)
  })

  it('renders the notification badge if the modal is hidden', async () => {
    setup(
      <HeaderDiscussionListModal
        signedInUser={{ ...signedInUser, discussions: [] }}
      />,
    )

    await act(async () => {
      mockUsePusher.mock.calls[0][2](discussion)
    })

    const badge = screen.getByRole('status', { name: /new message/i })
    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the modal isn't hidden", async () => {
    const { user } = setup(
      <HeaderDiscussionListModal
        signedInUser={{ ...signedInUser, discussions: [] }}
      />,
    )

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })
    await user.click(openBtn)

    await act(async () => {
      mockUsePusher.mock.calls[4][2](discussion)
    })

    const badge = screen.queryByRole('status', { name: /new message/i })
    expect(badge).not.toBeInTheDocument()
  })
})

describe('when receiving a new message in real time', () => {
  it('renders the notification badge if the modal is hidden', async () => {
    setup(
      <HeaderDiscussionListModal
        signedInUser={{ ...signedInUser, discussions: [] }}
      />,
    )

    await act(async () => {
      mockUsePusher.mock.calls[1][2](null)
    })

    const badge = screen.getByRole('status', { name: /new message/i })
    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the modal isn't hidden", async () => {
    const { user } = setup(
      <HeaderDiscussionListModal
        signedInUser={{ ...signedInUser, discussions: [] }}
      />,
    )

    const openBtn = screen.getByRole('button', {
      name: /open discussion list/i,
    })
    await user.click(openBtn)

    await act(async () => {
      mockUsePusher.mock.calls[3][2](null)
    })

    const badge = screen.queryByRole('status', { name: /new message/i })
    expect(badge).not.toBeInTheDocument()
  })
})
