import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscussionModal from '.'
import 'cross-fetch/polyfill'
import type { DiscussionMessageListProps } from 'components/DiscussionMessageList'

jest
  .mock('components/DiscussionMessageList', () => ({
    __esModule: true,
    default: ({ messages }: DiscussionMessageListProps) => {
      return (
        <ul>
          {messages.map((message) => (
            <li key={message.message}>
              {message.authorName} {message.authorImage}
            </li>
          ))}
        </ul>
      )
    },
  }))
  .mock('components/DiscussionSendBar', () => ({
    __esModule: true,
    default: () => <input type="text" />,
  }))

it('closes the modal if the close button is clicked', async () => {
  const onClose = jest.fn()

  render(
    <DiscussionModal
      onClose={onClose}
      postName="table"
      postId="0"
      sellerId="1"
    />
  )

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(onClose).toHaveBeenCalledTimes(1)
})

it('renders the message list if there is a discussion', () => {
  render(
    <DiscussionModal
      onClose={() => null}
      discussion={{
        id: '1',
        messages: [
          {
            message: 'yo',
            createdAt: new Date().toString(),
            seen: true,
            userId: '0',
          },
        ],
        buyer: { id: '0', name: 'john' },
        seller: { id: '2', name: 'jane' },
        postName: 'table',
        postId: '3',
        channelName: 'test',
        hasNewMessage: false,
      }}
    />
  )

  const messageList = screen.getByRole('list')

  expect(messageList).toBeInTheDocument()
})

it("doesn't render the message list if there isn't a discussion", () => {
  render(
    <DiscussionModal
      onClose={() => null}
      postName="table"
      postId="0"
      sellerId="1"
    />
  )

  const messageList = screen.queryByRole('list')

  expect(messageList).not.toBeInTheDocument()
})

it('renders the name and image of the author of a message correctly', () => {
  render(
    <DiscussionModal
      onClose={() => null}
      discussion={{
        id: '1',
        messages: [
          {
            message: 'yo',
            createdAt: new Date().toString(),
            seen: true,
            userId: '0',
          },
          {
            message: 'hi',
            createdAt: new Date().toString(),
            seen: false,
            userId: '2',
          },
        ],
        buyer: { id: '0', name: 'john', image: 'john.jpeg' },
        seller: { id: '2', name: 'jane', image: 'jane.jpeg' },
        postName: 'table',
        postId: '3',
        channelName: 'test',
        hasNewMessage: false,
      }}
    />
  )

  const messages = screen.getAllByRole('listitem')

  expect(messages[0]).toHaveTextContent('john john.jpeg')
  expect(messages[1]).toHaveTextContent('jane jane.jpeg')
})
