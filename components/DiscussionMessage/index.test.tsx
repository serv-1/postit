import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscussionMessage from '.'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

beforeEach(() => {
  mockUseSession.mockReturnValue({
    data: { id: '1', channelName: '', expires: '' },
    update: async () => null,
    status: 'authenticated',
  })
})

it('renders the message', () => {
  render(<DiscussionMessage message="hi" createdAt={new Date().toString()} />)

  const message = screen.getByText(/hi/i)

  expect(message).toBeInTheDocument()
})

it('renders the default user image if there is no author', () => {
  render(<DiscussionMessage message="hi" createdAt={new Date().toString()} />)

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
  expect(image).toHaveAttribute('alt', 'Default profile picture')
})

it("renders the default user image if the author doesn't have one", () => {
  render(
    <DiscussionMessage
      message="hi"
      createdAt={new Date().toString()}
      author={{ id: '0', name: 'john' }}
    />
  )

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
  expect(image).toHaveAttribute('alt', "john's profile picture")
})

it("renders the author's image", () => {
  render(
    <DiscussionMessage
      message="hi"
      createdAt={new Date().toString()}
      author={{ id: '0', name: 'john', image: 'john.jpg' }}
    />
  )

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.jpg')
  expect(image).toHaveAttribute('alt', "john's profile picture")
})

it('shows/hides the creation date on click', async () => {
  const dateStr = new Date().toString()

  const { container } = render(
    <DiscussionMessage message="hi" createdAt={dateStr} />
  )

  const message = container.firstElementChild!

  const date = screen.getByText(
    new Date(dateStr).toLocaleDateString() +
      ', ' +
      new Date(dateStr).toLocaleTimeString()
  )

  expect(date).toHaveClass('hidden')

  await userEvent.click(message)

  expect(date).toHaveClass('block')

  await userEvent.click(message)

  expect(date).toHaveClass('hidden')
})

it('renders the message aligned to the left', () => {
  const dateStr = new Date().toString()

  const { container } = render(
    <DiscussionMessage message="hi" createdAt={dateStr} />
  )

  const messageText = screen.getByText(/hi/i)
  const date = screen.getByText(
    new Date(dateStr).toLocaleDateString() +
      ', ' +
      new Date(dateStr).toLocaleTimeString()
  )

  expect(container.firstElementChild!).toHaveClass('flex-row')
  expect(messageText).toHaveClass('bg-fuchsia-300')
  expect(date).toHaveClass('left-48')
})

it('renders the message aligned to the right', () => {
  const dateStr = new Date().toString()

  const { container } = render(
    <DiscussionMessage
      message="hi"
      createdAt={dateStr}
      author={{ id: '1', name: 'john' }}
    />
  )

  const messageText = screen.getByText(/hi/i)
  const date = screen.getByText(
    new Date(dateStr).toLocaleDateString() +
      ', ' +
      new Date(dateStr).toLocaleTimeString()
  )

  expect(container.firstElementChild!).toHaveClass('flex-row-reverse')
  expect(messageText).toHaveClass('bg-fuchsia-200')
  expect(date).toHaveClass('right-48')
})
