import DiscussionListModal from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DiscussionsIdGetData } from 'app/api/discussions/[id]/types'
import type { DiscussionProps } from 'components/Discussion'

jest.mock('components/Discussion', () => ({
  __esModule: true,
  default: ({ isModalOpen }: DiscussionProps) => (
    <div role="dialog">{isModalOpen ? 'open' : 'closed'}</div>
  ),
}))

it('closes on close button click', async () => {
  const onClose = jest.fn()

  render(
    <DiscussionListModal
      isHidden={false}
      onClose={onClose}
      openedDiscussionId={null}
      setOpenedDiscussionId={() => null}
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
      discussions={[{ id: '0' }, { id: '1' }] as DiscussionsIdGetData[]}
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
      openedDiscussionId="0"
      setOpenedDiscussionId={() => null}
      discussions={[{ id: '0' }, { id: '1' }] as DiscussionsIdGetData[]}
    />
  )

  const discussions = screen.getAllByRole('dialog')

  expect(discussions[1]).toHaveTextContent('open')
  expect(discussions[2]).toHaveTextContent('closed')
})
