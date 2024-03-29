import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatMessage from '../../components/ChatMessage'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'
const defaultUserImage = process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE

it('renders', () => {
  const date = new Date()

  const { container } = render(
    <ChatMessage
      message="Hi"
      createdAt={date}
      image="keyName"
      name="john"
      isSignedInUser={true}
    />
  )

  const image = screen.getByRole('img')
  expect(image).toHaveAttribute('src', awsUrl + 'keyName')
  expect(image.getAttribute('alt')).toContain('john')

  const msgContainer = container.firstElementChild
  expect(msgContainer).toHaveClass('flex-row-reverse')

  const message = screen.getByText('Hi')
  expect(message).toHaveClass('bg-fuchsia-200')

  const dateText = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`
  const dateEl = screen.queryByText(dateText)
  expect(dateEl).not.toBeInTheDocument()
})

it('renders the default image', () => {
  render(
    <ChatMessage
      message="Hi"
      createdAt={new Date()}
      name="john"
      isSignedInUser={true}
    />
  )

  const image = screen.getByRole('img')
  expect(image).toHaveAttribute('src', defaultUserImage)
})

it('renders/unmounts the creation date on click', async () => {
  const date = new Date()

  render(
    <ChatMessage
      message="Hi"
      createdAt={date}
      image="john.jpeg"
      name="john"
      isSignedInUser={true}
    />
  )

  const image = screen.getByRole('img')
  await userEvent.click(image)

  const dateText = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`
  const dateEl = screen.getByText(dateText)
  expect(dateEl).toHaveClass('right-48')

  await userEvent.click(image)
  expect(dateEl).not.toBeInTheDocument()
})

it("uses different css classnames if the author isn't the signed in user", async () => {
  const date = new Date()

  const { container } = render(
    <ChatMessage
      message="Hi"
      createdAt={date}
      image="john.jpeg"
      name="john"
      isSignedInUser={false}
    />
  )

  const msgContainer = container.firstElementChild
  expect(msgContainer).toHaveClass('flex-row')

  const message = screen.getByText('Hi')
  expect(message).toHaveClass('bg-fuchsia-300')

  await userEvent.click(message)

  const dateText = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`
  const dateEl = screen.getByText(dateText)
  expect(dateEl).toHaveClass('left-48')
})
