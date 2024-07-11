import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscussionModal from '.'
import 'cross-fetch/polyfill'
import type { DiscussionMessageListProps } from 'components/DiscussionMessageList'
import type { User } from 'types'

jest
  .mock('components/DiscussionMessageList', () => ({
    __esModule: true,
    default: ({ messages }: DiscussionMessageListProps) => {
      return (
        <ul>
          {messages.map((message) => (
            <li key={message._id}></li>
          ))}
        </ul>
      )
    },
  }))
  .mock('components/DiscussionSendBar', () => ({
    __esModule: true,
    default: () => <input type="text" />,
  }))

const signedInUser: User = {
  _id: '1',
  name: 'john',
  email: 'john@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

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
      discussionId="0"
      messages={[]}
      signedInUser={signedInUser}
      interlocutor={null}
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
