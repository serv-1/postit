import { render, screen, waitFor } from '@testing-library/react'
import DiscussionMessageList from '.'
import type { User } from 'types'
import type { DiscussionMessageProps } from 'components/DiscussionMessage'

jest.mock('components/DiscussionMessage', () => ({
  __esModule: true,
  default: ({ message, author }: DiscussionMessageProps) => (
    <div>
      {message}
      <span>{author?.name}</span>
      <img src={author?.image} alt="" /> {/* eslint-disable-line */}
    </div>
  ),
}))

beforeEach(() => {
  Element.prototype.scroll = jest.fn()
})

const signedInUser: User = {
  _id: '1',
  name: 'john',
  image: 'john.jpg',
  email: 'john@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

const interlocutor: User = {
  _id: '2',
  name: 'jane',
  image: 'jane.jpg',
  email: 'jane@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

it('renders the messages', async () => {
  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          seen: true,
          userId: signedInUser._id,
        },
        {
          _id: '1',
          message: 'hi',
          createdAt: new Date().toString(),
          seen: true,
          userId: interlocutor._id,
        },
      ]}
    />
  )

  const messages = screen.getAllByRole('listitem')

  expect(messages).toHaveLength(2)
})

it('scrolls until the last message of the discussion is visible', async () => {
  const { container } = render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'hi',
          createdAt: new Date().toString(),
          userId: '0',
          seen: true,
        },
      ]}
    />
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
  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: signedInUser._id,
          seen: true,
        },
      ]}
    />
  )

  const authorName = screen.getByText(signedInUser.name)

  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('presentation')

  expect(authorImage).toHaveAttribute('src', signedInUser.image)
})

it('renders the message with the interlocutor as the author', () => {
  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={interlocutor}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: interlocutor._id,
          seen: true,
        },
      ]}
    />
  )

  const authorName = screen.getByText(interlocutor.name)

  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('presentation')

  expect(authorImage).toHaveAttribute('src', interlocutor.image)
})

it('renders the message with its author deleted', () => {
  render(
    <DiscussionMessageList
      signedInUser={signedInUser}
      interlocutor={null}
      messages={[
        {
          _id: '0',
          message: 'yo',
          createdAt: new Date().toString(),
          userId: '3',
          seen: true,
        },
      ]}
    />
  )

  const authorName = screen.getByText('deleted')

  expect(authorName).toBeInTheDocument()

  const authorImage = screen.getByRole('presentation')

  expect(authorImage).not.toHaveAttribute('src')
})
