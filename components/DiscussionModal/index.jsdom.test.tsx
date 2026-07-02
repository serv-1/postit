import DiscussionModal from '.'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import usePusher from 'hooks/usePusher'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import usersIdHandlers from 'app/api/users/[id]/mock'
import Toast from 'components/Toast'
import { buildDiscussion, buildMessage, buildUser } from 'test-utils/factories'

const mockUsePusher = vi.mocked(usePusher)

vi.mock('hooks/usePusher', () => ({
  default: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  getCsrfToken: vi.fn(),
}))

vi.mock('next/image')

const server = setupServer(...usersIdHandlers)

beforeEach(() => {
  Element.prototype.scroll = () => null
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the loading spinner if the interlocutor hasn't been fetched yet", () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion()}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  const loadingSpinner = screen.getByRole('status')
  expect(loadingSpinner).toBeInTheDocument()
})

it('renders open', async () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion()}
      signedInUser={buildUser()}
      isHidden={false}
      setOpenedDiscussionId={() => null}
    />,
  )

  const modal = await screen.findByRole('dialog')
  expect(modal).not.toHaveClass('hidden')
})

it('renders closed', async () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion()}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  const modal = await screen.findByRole('dialog')
  expect(modal).toHaveClass('hidden')
})

it('opens by clicking on the open button', async () => {
  const setOpenedDiscussionId = vi.fn()
  const discussion = buildDiscussion()

  render(
    <DiscussionModal
      discussion={discussion}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={setOpenedDiscussionId}
    />,
  )

  const openBtn = await screen.findByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  expect(setOpenedDiscussionId).toHaveBeenNthCalledWith(1, discussion._id)
})

it('renders the notification badge if there is a new message while being closed', async () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion({
        messages: [buildMessage({ seen: false })],
      })}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  const badge = await screen.findByRole('status', { name: /new message/i })
  expect(badge).toBeInTheDocument()
})

it("doesn't render the notification badge if there is no new message", async () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion()}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  await waitForElementToBeRemoved(() => screen.getByRole('status'))

  const badge = screen.queryByRole('status', { name: /new message/i })
  expect(badge).not.toBeInTheDocument()
})

it("doesn't render the notification badge while being open", async () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion({
        messages: [buildMessage({ seen: false })],
      })}
      signedInUser={buildUser()}
      isHidden={false}
      setOpenedDiscussionId={() => null}
    />,
  )

  await waitForElementToBeRemoved(() => screen.getByRole('status'))

  const badge = screen.queryByRole('status', { name: /new message/i })
  expect(badge).not.toBeInTheDocument()
})

it('unmounts the notification badge when the modal opens', async () => {
  server.use(
    http.put('api/discussions/:id', () => {
      return new HttpResponse(null, { status: 204 })
    }),
  )

  render(
    <DiscussionModal
      discussion={buildDiscussion({
        messages: [buildMessage({ seen: false })],
      })}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  const badge = await screen.findByRole('status', { name: /new message/i })

  const openBtn = screen.getByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  expect(badge).not.toBeInTheDocument()
})

describe('on "openDiscussion" event', () => {
  describe('if the discussion ids match', () => {
    it('opens', async () => {
      const setOpenedDiscussionId = vi.fn()
      const discussion = buildDiscussion()

      render(
        <DiscussionModal
          discussion={discussion}
          signedInUser={buildUser()}
          isHidden
          setOpenedDiscussionId={setOpenedDiscussionId}
        />,
      )

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion._id }),
        )
      })

      expect(setOpenedDiscussionId).toHaveBeenNthCalledWith(1, discussion._id)
    })

    it('unmounts the notification badge', async () => {
      const discussion = buildDiscussion({
        messages: [buildMessage({ seen: false })],
      })

      server.use(
        http.put('api/discussions/:id', () => {
          return new HttpResponse(null, { status: 204 })
        }),
      )

      render(
        <DiscussionModal
          discussion={discussion}
          signedInUser={buildUser()}
          isHidden
          setOpenedDiscussionId={() => null}
        />,
      )

      const badge = await screen.findByRole('status', { name: /new message/i })

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion._id }),
        )
      })

      expect(badge).not.toBeInTheDocument()
    })
  })

  describe("if the discussion ids don't match", () => {
    it("doesn't open", async () => {
      const setOpenedDiscussionId = vi.fn()

      render(
        <DiscussionModal
          discussion={buildDiscussion()}
          signedInUser={buildUser()}
          isHidden
          setOpenedDiscussionId={setOpenedDiscussionId}
        />,
      )

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      expect(setOpenedDiscussionId).not.toHaveBeenCalled()
    })

    it("doesn't unmount the notification badge", async () => {
      render(
        <DiscussionModal
          discussion={buildDiscussion({
            messages: [buildMessage({ seen: false })],
          })}
          signedInUser={buildUser()}
          isHidden
          setOpenedDiscussionId={() => null}
        />,
      )

      const badge = await screen.findByRole('status', { name: /new message/i })

      await act(async () => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: '1' }),
        )
      })

      expect(badge).toBeInTheDocument()
    })
  })
})

describe('when a new message is received', () => {
  it("renders the notification badge if the author of the message isn't the authenticated user while being closed", async () => {
    render(
      <DiscussionModal
        discussion={buildDiscussion()}
        signedInUser={buildUser()}
        isHidden
        setOpenedDiscussionId={() => null}
      />,
    )

    await act(async () => {
      mockUsePusher.mock.calls[0][2](buildMessage())
    })

    const badge = screen.getByRole('status', { name: /new message/i })
    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the author of the message is the authenticated user while being closed", async () => {
    const signedInUser = buildUser()

    render(
      <DiscussionModal
        discussion={buildDiscussion()}
        signedInUser={signedInUser}
        isHidden
        setOpenedDiscussionId={() => null}
      />,
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('status'))

    await act(async () => {
      mockUsePusher.mock.calls[0][2](buildMessage({ userId: signedInUser._id }))
    })

    const badge = screen.queryByRole('status')
    expect(badge).not.toBeInTheDocument()
  })

  it("doesn't render the notification badge if the author of the message isn't the authenticated user while being open", async () => {
    render(
      <DiscussionModal
        discussion={buildDiscussion()}
        signedInUser={buildUser()}
        isHidden={false}
        setOpenedDiscussionId={() => null}
      />,
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('status'))

    await act(async () => {
      mockUsePusher.mock.calls[0][2](buildMessage())
    })

    const badge = screen.queryByRole('status')
    expect(badge).not.toBeInTheDocument()
  })
})

it('fetches the interlocutor (seller) if the authenticated user is the buyer', async () => {
  const signedInUser = buildUser()
  const discussion = buildDiscussion({ buyerId: signedInUser._id })

  server.use(
    http.get('api/users/:id', ({ params }) => {
      expect(params.id).toBe(discussion.sellerId)

      return HttpResponse.json(buildUser({ _id: discussion.sellerId }), {
        status: 200,
      })
    }),
  )

  render(
    <DiscussionModal
      discussion={discussion}
      signedInUser={signedInUser}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )
})

it('renders an error if the server fails to fetch the interlocutor (seller)', async () => {
  server.use(
    http.get('api/users/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    }),
  )

  render(
    <>
      <DiscussionModal
        discussion={buildDiscussion()}
        signedInUser={buildUser()}
        isHidden
        setOpenedDiscussionId={() => null}
      />
      <Toast />
    </>,
  )

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent('error')
})

it('fetches the interlocutor (buyer) if the authenticated user is the seller', async () => {
  const signedInUser = buildUser()
  const discussion = buildDiscussion({ sellerId: signedInUser._id })

  server.use(
    http.get('api/users/:id', ({ params }) => {
      expect(params.id).toBe(discussion.buyerId)

      return HttpResponse.json(buildUser({ _id: discussion.buyerId }), {
        status: 200,
      })
    }),
  )

  render(
    <DiscussionModal
      discussion={discussion}
      signedInUser={signedInUser}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )
})

it('renders an error if the server fails to fetch the interlocutor (buyer)', async () => {
  server.use(
    http.get('api/users/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    }),
  )

  render(
    <>
      <DiscussionModal
        discussion={buildDiscussion()}
        signedInUser={buildUser()}
        isHidden
        setOpenedDiscussionId={() => null}
      />
      <Toast />
    </>,
  )

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent('error')
})

it("doesn't fetch the interlocutor if he has deleted its account", async () => {
  render(
    <DiscussionModal
      discussion={buildDiscussion({ sellerId: undefined })}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  const interlocutorName = await screen.findByText(/deleted/i)
  expect(interlocutorName).toBeInTheDocument()
})

it('removes the interlocutor if he has deleted his account', async () => {
  server.use(
    http.get('api/users/:id', () => {
      return HttpResponse.json(buildUser(), { status: 200 })
    }),
  )

  render(
    <DiscussionModal
      discussion={buildDiscussion()}
      signedInUser={buildUser()}
      isHidden
      setOpenedDiscussionId={() => null}
    />,
  )

  const interlocutorName = await screen.findByText(/john/i)

  await act(async () => {
    mockUsePusher.mock.calls[3][2](null)
  })

  expect(interlocutorName).not.toHaveTextContent(/john/i)
})
