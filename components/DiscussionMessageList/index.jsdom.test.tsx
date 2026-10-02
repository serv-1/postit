import { render, screen, waitFor } from '@testing-library/react'
import DiscussionMessageList from '.'
import { act } from 'react'
import usePusher from 'hooks/usePusher'
import type { DiscussionMessageProps } from 'components/DiscussionMessage'
import { buildMessage, buildUser } from 'test-utils/factories'

vi.mock('hooks/usePusher', () => ({
  default: vi.fn(),
}))

vi.mock('components/DiscussionMessage', () => ({
  default: ({ message, author }: DiscussionMessageProps) => (
    <div>
      {message}
      <span>{author?.name}</span>
      <img src={author?.image} alt="" /> {/* eslint-disable-line */}
    </div>
  ),
}))

beforeEach(() => {
  Element.prototype.scroll = vi.fn()
})

const mockUsePusher = vi.mocked(usePusher)

it('renders the messages', async () => {
  const signedInUser = buildUser()
  const interlocutor = buildUser()

  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={interlocutor}
      messages={[
        buildMessage({ userId: signedInUser._id }),
        buildMessage({ userId: interlocutor._id }),
      ]}
      discussionId=""
    />,
  )

  const messages = screen.getAllByRole('listitem')
  expect(messages).toHaveLength(2)
})

it('scrolls until the last message of the discussion is visible', async () => {
  const signedInUser = buildUser()

  const { container } = render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={buildUser()}
      messages={[buildMessage({ userId: signedInUser._id })]}
      discussionId=""
    />,
  )

  const msgList = container.firstElementChild!

  await waitFor(() => {
    expect(msgList.scroll).toHaveBeenNthCalledWith(1, {
      top: msgList.scrollHeight,
      behavior: 'smooth',
    })
  })
})

it('renders the message with the signed in user as the author', () => {
  const signedInUser = buildUser()

  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={buildUser()}
      messages={[buildMessage({ userId: signedInUser._id })]}
      discussionId=""
    />,
  )

  const authorName = screen.getByText(signedInUser.name)
  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('presentation')
  expect(authorImage).toHaveAttribute('src', signedInUser.image)
})

it('renders the message with the interlocutor as the author', () => {
  const interlocutor = buildUser()

  render(
    <DiscussionMessageList
      signedInUser={buildUser()}
      interlocutor={interlocutor}
      messages={[buildMessage({ userId: interlocutor._id })]}
      discussionId=""
    />,
  )

  const authorName = screen.getByText(interlocutor.name)
  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('presentation')
  expect(authorImage).toHaveAttribute('src', interlocutor.image)
})

it('renders the message with its author deleted', () => {
  const interlocutor = buildUser()

  render(
    <DiscussionMessageList
      signedInUser={buildUser()}
      interlocutor={null}
      messages={[buildMessage({ userId: interlocutor._id })]}
      discussionId=""
    />,
  )

  const authorName = screen.getByText('deleted')
  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('presentation')
  expect(authorImage).not.toHaveAttribute('src')
})

it('receives a new message in real-time', async () => {
  const signedInUser = buildUser()
  const interlocutor = buildUser()

  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={interlocutor}
      messages={[buildMessage({ userId: signedInUser._id })]}
      discussionId=""
    />,
  )

  await act(async () => {
    mockUsePusher.mock.calls[0][2](
      buildMessage({ userId: interlocutor._id, seen: false }),
    )
  })

  const messages = screen.getAllByRole('listitem')
  expect(messages).toHaveLength(2)
  expect(messages[1]).toHaveTextContent('yo')
})
