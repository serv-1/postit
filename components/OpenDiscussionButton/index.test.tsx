import { render, screen } from '@testing-library/react'
import OpenDiscussionButton from '.'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import userEvent from '@testing-library/user-event'

it('renders the interlocutor name', () => {
  render(
    <OpenDiscussionButton
      onClick={() => null}
      postName="table"
      interlocutorName="john"
    />
  )

  const interlocutorName = screen.getByText('john')
  const interlocutorImage = screen.getByRole('img')

  expect(interlocutorName).toBeInTheDocument()
  expect(interlocutorImage).toHaveAttribute('alt', "john's profile picture")
})

it('renders "deleted" instead of the interlocutor name if it is undefined', () => {
  render(<OpenDiscussionButton onClick={() => null} postName="table" />)

  const interlocutorName = screen.getByText('deleted')

  expect(interlocutorName).toBeInTheDocument()
})

it('renders the post name', () => {
  render(<OpenDiscussionButton onClick={() => null} postName="table" />)

  const postName = screen.getByText('table')

  expect(postName).toBeInTheDocument()
})

it('renders the interlocutor image', () => {
  render(
    <OpenDiscussionButton
      onClick={() => null}
      postName="table"
      interlocutorImage="john.png"
    />
  )

  const interlocutorImage = screen.getByRole('img')

  expect(interlocutorImage).toHaveAttribute(
    'src',
    NEXT_PUBLIC_AWS_URL + '/john.png'
  )
})

it('renders the default user image', () => {
  render(<OpenDiscussionButton onClick={() => null} postName="table" />)

  const interlocutorImage = screen.getByRole('img')

  expect(interlocutorImage).toHaveAttribute(
    'src',
    NEXT_PUBLIC_DEFAULT_USER_IMAGE
  )
})

it('handles the click event', async () => {
  const onClick = jest.fn()

  render(<OpenDiscussionButton onClick={onClick} postName="table" />)

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(onClick).toHaveBeenCalledTimes(1)
})
