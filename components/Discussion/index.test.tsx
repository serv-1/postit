import Discussion from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import usePusher from 'hooks/usePusher'

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ toast: {}, setToast: () => null }),
  }))
  .mock('hooks/usePusher', () => ({
    __esModule: true,
    default: jest.fn(),
  }))

const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockUsePusher = usePusher as jest.MockedFunction<typeof usePusher>

const discussion = {
  id: '0',
  buyer: { id: '1', name: 'john' },
  seller: { id: '2', name: 'jane' },
  channelName: 'test',
  postName: 'table',
  postId: '3',
  hasNewMessage: false,
  messages: [
    {
      userId: '1',
      seen: true,
      message: 'yo',
      createdAt: new Date().toString(),
    },
  ],
}

beforeEach(() => {
  Element.prototype.scroll = () => null

  mockUseSession.mockReturnValue({ data: { id: '1' } })
})

test('the modal is open', () => {
  render(
    <Discussion
      discussion={discussion}
      isModalOpen
      setOpenedDiscussionId={() => null}
    />
  )

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
})

test('the modal is closed', () => {
  render(
    <Discussion
      discussion={discussion}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
})

it('opens the modal by clicking on the "open discussion" button', async () => {
  const setOpenedDiscussionId = jest.fn()

  render(
    <Discussion
      discussion={discussion}
      isModalOpen={false}
      setOpenedDiscussionId={setOpenedDiscussionId}
    />
  )

  const openBtn = screen.getByRole('button', { name: /open/i })

  await userEvent.click(openBtn)

  expect(setOpenedDiscussionId).toHaveBeenNthCalledWith(1, discussion.id)
})

it('renders the notification badge if there is a new message and if the modal is closed', async () => {
  render(
    <Discussion
      discussion={{ ...discussion, hasNewMessage: true }}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const badge = screen.getByRole('status')

  expect(badge).toHaveAccessibleName(/jane/i)
})

it("doesn't render the notification badge if there isn't a new message even if the modal is closed", async () => {
  render(
    <Discussion
      discussion={discussion}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const badge = screen.queryByRole('status')

  expect(badge).not.toBeInTheDocument()
})

it("doesn't render the notification badge if there is a new message but the modal is open", async () => {
  render(
    <Discussion
      discussion={{ ...discussion, hasNewMessage: true }}
      isModalOpen
      setOpenedDiscussionId={() => null}
    />
  )

  const badge = screen.queryByRole('status')

  expect(badge).not.toBeInTheDocument()
})

it('unmounts the notification badge when the modal opens', async () => {
  render(
    <Discussion
      discussion={{ ...discussion, hasNewMessage: true }}
      isModalOpen={false}
      setOpenedDiscussionId={() => null}
    />
  )

  const badge = screen.getByRole('status')
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
          isModalOpen={false}
          setOpenedDiscussionId={setOpenedDiscussionId}
        />
      )

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion.id })
        )
      })

      expect(setOpenedDiscussionId).toHaveBeenNthCalledWith(1, discussion.id)
    })

    it('unmounts the notification badge', () => {
      render(
        <Discussion
          discussion={{ ...discussion, hasNewMessage: true }}
          isModalOpen={false}
          setOpenedDiscussionId={() => null}
        />
      )

      const badge = screen.getByRole('status')

      act(() => {
        document.dispatchEvent(
          new CustomEvent('openDiscussion', { detail: discussion.id })
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

    it("doesn't unmount the notification badge", () => {
      render(
        <Discussion
          discussion={{ ...discussion, hasNewMessage: true }}
          isModalOpen={false}
          setOpenedDiscussionId={() => null}
        />
      )

      const badge = screen.getByRole('status')

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
        isModalOpen
        setOpenedDiscussionId={() => null}
      />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it("renders the notification badge if the author of the message isn't the authenticated user and if the modal is closed", () => {
    render(
      <Discussion
        discussion={discussion}
        isModalOpen={false}
        setOpenedDiscussionId={() => null}
      />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        userId: '2',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const badge = screen.getByRole('status')

    expect(badge).toBeInTheDocument()
  })

  it("doesn't render the notification badge if the author of the message is the authenticated user even if the modal is closed", () => {
    render(
      <Discussion
        discussion={discussion}
        isModalOpen={false}
        setOpenedDiscussionId={() => null}
      />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2]({
        userId: '1',
        seen: true,
        message: 'hello',
        createdAt: new Date().toString(),
      })
    })

    const badge = screen.queryByRole('status')

    expect(badge).not.toBeInTheDocument()
  })

  it("doesn't render the notification badge if the author of the message isn't the authenticated user but the modal is open", () => {
    render(
      <Discussion
        discussion={discussion}
        isModalOpen
        setOpenedDiscussionId={() => null}
      />
    )

    act(() => {
      mockUsePusher.mock.calls[0][2]({
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
