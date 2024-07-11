import Discussion from '.'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import usePusher from 'hooks/usePusher'
import type { Discussion as IDiscussion, User } from 'types'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import usersIdHandlers from 'app/api/users/[id]/mock'

const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockUsePusher = usePusher as jest.MockedFunction<typeof usePusher>
const mockSetToast = jest.fn()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ toast: {}, setToast: mockSetToast }),
  }))
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

const discussion: IDiscussion = {
  _id: '0',
  buyerId: '1',
  sellerId: '2',
  channelName: 'discussion channel name',
  postName: 'table',
  postId: '3',
  hasNewMessage: false,
  messages: [
    {
      _id: '0',
      userId: '1',
      seen: true,
      message: 'yo',
      createdAt: new Date().toString(),
    },
  ],
}

const signedInUser: User = {
  _id: '0',
  name: 'jane',
  email: 'jane@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

const server = setupServer(...usersIdHandlers)

beforeEach(() => {
  Element.prototype.scroll = () => null

  mockUseSession.mockReturnValue({ data: { id: '1' } })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the loading spinner if the interlocutor hasn't been fetched yet", () => {
  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const loadingSpinner = screen.getByRole('status')

  expect(loadingSpinner).toBeInTheDocument()
})

it('renders the modal opened', async () => {
  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen
      setOpenedDiscussionId={() => null}
    />
  )

  const modal = await screen.findByRole('dialog')

  expect(modal).toBeInTheDocument()
})

it('renders the modal closed', async () => {
  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  await waitForElementToBeRemoved(() => screen.getByRole('status'))

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
})

it('opens the modal by clicking on the "open discussion" button', async () => {
  const setOpenedDiscussionId = jest.fn()

  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={setOpenedDiscussionId}
    />
  )

  const openBtn = await screen.findByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  expect(setOpenedDiscussionId).toHaveBeenNthCalledWith(1, discussion._id)
})

it('renders the notification badge if there is a new message and if the modal is closed', async () => {
  render(
    <Discussion
      discussion={{ ...discussion, hasNewMessage: true }}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const badge = await screen.findByRole('status', { name: /john/i })

  expect(badge).toBeInTheDocument()
})

it("doesn't render the notification badge if there isn't a new message even if the modal is closed", async () => {
  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  await waitForElementToBeRemoved(() => screen.getByRole('status'))

  const badge = screen.queryByRole('status')

  expect(badge).not.toBeInTheDocument()
})

it("doesn't render the notification badge if the modal is open even if there is a new message", async () => {
  render(
    <Discussion
      discussion={{ ...discussion, hasNewMessage: true }}
      signedInUser={signedInUser}
      isModalOpen
      setOpenedDiscussionId={() => null}
    />
  )

  await waitForElementToBeRemoved(() => screen.getByRole('status'))

  const badge = screen.queryByRole('status')

  expect(badge).not.toBeInTheDocument()
})

it('unmounts the notification badge when the modal opens', async () => {
  render(
    <Discussion
      discussion={{ ...discussion, hasNewMessage: true }}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const badge = await screen.findByRole('status', { name: /john/i })
  const openBtn = screen.getByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  expect(badge).not.toBeInTheDocument()
})

describe('on "openDiscussion" event', () => {
  describe('if the ids match', () => {
    it('opens the modal', () => {
      const setOpenedDiscussionId = jest.fn()

      render(
        <Discussion
          discussion={discussion}
          signedInUser={signedInUser}
          isModalOpen={false}
          setOpenedDiscussionId={setOpenedDiscussionId}
        />
      )

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion._id })
        )
      })

      expect(setOpenedDiscussionId).toHaveBeenNthCalledWith(1, discussion._id)
    })

    it('unmounts the notification badge', async () => {
      render(
        <Discussion
          discussion={{ ...discussion, hasNewMessage: true }}
          signedInUser={signedInUser}
          isModalOpen={false}
          setOpenedDiscussionId={() => null}
        />
      )

      const badge = await screen.findByRole('status', { name: /john/i })

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion._id })
        )
      })

      expect(badge).not.toBeInTheDocument()
    })
  })

  describe("if the ids don't match", () => {
    it("doesn't open the modal", () => {
      const setOpenedDiscussionId = jest.fn()

      render(
        <Discussion
          discussion={discussion}
          signedInUser={signedInUser}
          isModalOpen={false}
          setOpenedDiscussionId={setOpenedDiscussionId}
        />
      )

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      expect(setOpenedDiscussionId).not.toHaveBeenCalled()
    })

    it("doesn't unmount the notification badge", async () => {
      render(
        <Discussion
          discussion={{ ...discussion, hasNewMessage: true }}
          signedInUser={signedInUser}
          isModalOpen={false}
          setOpenedDiscussionId={() => null}
        />
      )

      const badge = await screen.findByRole('status', { name: /john/i })

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' })
        )
      })

      expect(badge).toBeInTheDocument()
    })
  })
})

describe('when a new message is received in real time', () => {
  it('renders the new message', async () => {
    render(
      <Discussion
        discussion={discussion}
        signedInUser={signedInUser}
        isModalOpen
        setOpenedDiscussionId={() => null}
      />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        _id: '1',
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const message = await screen.findByText('hello')

    expect(message).toBeInTheDocument()
  })

  it("renders the notification badge if the author of the message isn't the authenticated user and if the modal is closed", async () => {
    render(
      <Discussion
        discussion={discussion}
        signedInUser={signedInUser}
        isModalOpen={false}
        setOpenedDiscussionId={() => null}
      />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        _id: '1',
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const badge = await screen.findByRole('status', { name: /john/i })

    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the author of the message is the authenticated user even if the modal is closed", async () => {
    render(
      <Discussion
        discussion={discussion}
        signedInUser={signedInUser}
        isModalOpen={false}
        setOpenedDiscussionId={() => null}
      />
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('status'))

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        _id: '1',
        userId: '1',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const badge = screen.queryByRole('status')

    expect(badge).not.toBeInTheDocument()
  })

  it("doesn't render the notification badge if the author of the message isn't the authenticated user but the modal is open", async () => {
    render(
      <Discussion
        discussion={discussion}
        signedInUser={signedInUser}
        isModalOpen
        setOpenedDiscussionId={() => null}
      />
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('status'))

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        _id: '1',
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const badge = screen.queryByRole('status')

    expect(badge).not.toBeInTheDocument()
  })
})

it('fetches the interlocutor who is the seller if the authenticated user is the buyer', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('2')

      return res(ctx.status(200), ctx.json({ ...signedInUser, _id: '2' }))
    })
  )

  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )
})

it('renders an error if the server fails to fetch the interlocutor as the seller', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('fetches the interlocutor who is the buyer if the authenticated user is the seller', async () => {
  mockUseSession.mockReturnValue({ data: { id: '2' } })

  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('1')

      return res(ctx.status(200), ctx.json({ ...signedInUser, _id: '1' }))
    })
  )

  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )
})

it('renders an error if the server fails to fetch the interlocutor as the buyer', async () => {
  mockUseSession.mockReturnValue({ data: { id: '2' } })

  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <Discussion
      discussion={discussion}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it("doesn't fetch the interlocutor if he has deleted its account", async () => {
  render(
    <Discussion
      discussion={{ ...discussion, sellerId: undefined }}
      signedInUser={signedInUser}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const interlocutorName = await screen.findByText(/deleted/i)

  expect(interlocutorName).toBeInTheDocument()
})
