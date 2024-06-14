import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscussionMessage from '.'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'

it("renders the message's text", () => {
  render(
    <DiscussionMessage
      message="hi"
      createdAt={new Date().toString()}
      authorName="john"
    />
  )

  const messageText = screen.getByText(/hi/i)

  expect(messageText).toBeInTheDocument()
})

it("renders the default image if the user doesn't have one", () => {
  render(
    <DiscussionMessage
      message="hi"
      createdAt={new Date().toString()}
      authorName="john"
    />
  )

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
  expect(image).toHaveAttribute('alt', "john's profile picture")
})

it('renders the user image', () => {
  render(
    <DiscussionMessage
      message="hi"
      createdAt={new Date().toString()}
      authorImage="john.jpg"
      authorName="john"
    />
  )

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.jpg')
})

it('shows/hides the creation date on click', async () => {
  const dateStr = new Date().toString()

  const { container } = render(
    <DiscussionMessage message="hi" createdAt={dateStr} authorName="john" />
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
    <DiscussionMessage
      message="hi"
      createdAt={dateStr}
      authorName="john"
      isLeftAligned
    />
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
    <DiscussionMessage message="hi" createdAt={dateStr} authorName="john" />
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
