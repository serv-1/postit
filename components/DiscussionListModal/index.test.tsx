import DiscussionListModal from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DiscussionProps } from 'components/Discussion'
import type { Discussion, User } from 'types'

jest.mock('components/Discussion', () => ({
  __esModule: true,
  default: ({ isModalOpen }: DiscussionProps) => (
    <div role="dialog">{isModalOpen ? 'open' : 'closed'}</div>
  ),
}))

const signedInUser: User = {
  _id: '0',
  name: 'john',
  email: 'john@test.com',
  channelName: '',
  postIds: [],
  favPostIds: [],
  discussions: [],
}

const discussion: Discussion = {
  _id: '1',
  postId: '2',
  postName: 'table',
  buyerId: '3',
  sellerId: '4',
  messages: [],
  channelName: '',
  hasNewMessage: false,
}

it('closes on close button click', async () => {
  const onClose = jest.fn()

  render(
    <DiscussionListModal
      isHidden={false}
      onClose={onClose}
      openedDiscussionId={null}
      setOpenedDiscussionId={() => null}
      signedInUser={signedInUser}
    />
  )

  const closeBtn = screen.getByRole('button', { name: /close/i })

  await userEvent.click(closeBtn)

  expect(onClose).toHaveBeenCalled()
})

it('renders a loading indicator if the discussions are undefined', () => {
  render(
    <DiscussionListModal
      isHidden={false}
      onClose={() => null}
      openedDiscussionId={null}
      setOpenedDiscussionId={() => null}
      signedInUser={signedInUser}
    />
  )

  const loadingIndicator = screen.getByText(/loading/i)

  expect(loadingIndicator).toBeInTheDocument()
})

it('renders a informative text if there are no discussions', () => {
  render(
    <DiscussionListModal
      isHidden={false}
      onClose={() => null}
      openedDiscussionId={null}
      setOpenedDiscussionId={() => null}
      discussions={[]}
      signedInUser={signedInUser}
    />
  )

  const text = screen.getByText(/your discussions will be displayed here/i)

  expect(text).toBeInTheDocument()
})

it('renders a list of discussions', () => {
  render(
    <DiscussionListModal
      isHidden={false}
      onClose={() => null}
      openedDiscussionId={null}
      setOpenedDiscussionId={() => null}
      discussions={[discussion, { ...discussion, _id: '9' }]}
      signedInUser={signedInUser}
    />
  )

  const discussions = screen.getAllByRole('listitem')

  expect(discussions).toHaveLength(2)
})

it('opens the discussion which has to be open', () => {
  render(
    <DiscussionListModal
      isHidden={false}
      onClose={() => null}
      openedDiscussionId="1"
      setOpenedDiscussionId={() => null}
      discussions={[discussion, { ...discussion, _id: '9' }]}
      signedInUser={signedInUser}
    />
  )

  const discussions = screen.getAllByRole('dialog')

  expect(discussions[1]).toHaveTextContent('open')
  expect(discussions[2]).toHaveTextContent('closed')
})
