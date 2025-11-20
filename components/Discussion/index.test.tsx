import Discussion from '.'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import usePusher from 'hooks/usePusher'
import type { Discussion as IDiscussion, User } from 'types'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import usersIdHandlers from 'app/api/users/[id]/mock'
import Toast from 'components/Toast'
// @ts-expect-error
import { mockUseSession } from 'next-auth/react'

const mockUsePusher = usePusher as jest.MockedFunction<typeof usePusher>

jest
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next-auth/react')

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
    it('opens the modal', async () => {
      const setOpenedDiscussionId = jest.fn()

      render(
        <Discussion
          discussion={discussion}
          signedInUser={signedInUser}
          isModalOpen={false}
          setOpenedDiscussionId={setOpenedDiscussionId}
        />
      )

      await act(async () => {
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

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion._id })
        )
      })

      expect(badge).not.toBeInTheDocument()
    })
  })

  describe("if the ids don't match", () => {
    it("doesn't open the modal", async () => {
      const setOpenedDiscussionId = jest.fn()

      render(
        <Discussion
          discussion={discussion}
          signedInUser={signedInUser}
          isModalOpen={false}
          setOpenedDiscussionId={setOpenedDiscussionId}
        />
      )

      await act(async () => {
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

      await act(async () => {
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

    await act(async () => {
      mockUsePusher.mock.calls[0][2]({
        _id: '1',
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const message = screen.getByText('hello')

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

    await act(async () => {
      mockUsePusher.mock.calls[0][2]({
        _id: '1',
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const badge = screen.getByRole('status', { name: /john/i })

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

    await act(async () => {
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

    await act(async () => {
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
    http.get('http://localhost/api/users/:id', ({ params }) => {
      expect(params.id).toBe('2')

      return HttpResponse.json({ ...signedInUser, _id: '2' }, { status: 200 })
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
    http.get('http://localhost/api/users/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Discussion
        discussion={discussion}
        signedInUser={signedInUser}
        isModalOpen={false}
        setOpenedDiscussionId={() => null}
      />
      <Toast />
    </>
  )

  const toast = await screen.findByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('fetches the interlocutor who is the buyer if the authenticated user is the seller', async () => {
  mockUseSession.mockReturnValue({ data: { id: '2' } })

  server.use(
    http.get('http://localhost/api/users/:id', ({ params }) => {
      expect(params.id).toBe('1')

      return HttpResponse.json({ ...signedInUser, _id: '1' }, { status: 200 })
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
    http.get('http://localhost/api/users/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Discussion
        discussion={discussion}
        signedInUser={signedInUser}
        isModalOpen={false}
        setOpenedDiscussionId={() => null}
      />
      <Toast />
    </>
  )

  const toast = await screen.findByRole('alert')

  expect(toast).toHaveTextContent('error')
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

it('removes the interlocutor if he has deleted his account', async () => {
  server.use(
    http.get('http://localhost/api/users/:id', () => {
      return HttpResponse.json(
        { ...signedInUser, _id: '2', name: 'john' },
        { status: 200 }
      )
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

  const interlocutorName = await screen.findByText(/john/i)

  await act(async () => {
    mockUsePusher.mock.calls[3][2](null)
  })

  expect(interlocutorName).not.toHaveTextContent(/john/i)
})
