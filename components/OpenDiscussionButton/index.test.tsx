import { render, screen } from '@testing-library/react'
import OpenDiscussionButton from '.'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import userEvent from '@testing-library/user-event'

it('renders the user name', () => {
  render(
    <OpenDiscussionButton
      onClick={() => null}
      postName="table"
      userName="john"
    />
  )

  const userName = screen.getByText('john')
  const userImage = screen.getByRole('img')

  expect(userName).toBeInTheDocument()
  expect(userImage).toHaveAttribute('alt', "john's profile picture")
})

it('renders the post name', () => {
  render(
    <OpenDiscussionButton
      onClick={() => null}
      postName="table"
      userName="john"
    />
  )

  const postName = screen.getByText('table')

  expect(postName).toBeInTheDocument()
})

it('renders the user image', () => {
  render(
    <OpenDiscussionButton
      onClick={() => null}
      postName="table"
      userName="john"
      userImage="john.png"
    />
  )

  const userImage = screen.getByRole('img')

  expect(userImage).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.png')
})

it('renders the default user image', () => {
  render(
    <OpenDiscussionButton
      onClick={() => null}
      postName="table"
      userName="john"
    />
  )

  const userImage = screen.getByRole('img')

  expect(userImage).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
})

it('handles the click event', async () => {
  const onClick = jest.fn()

  render(
    <OpenDiscussionButton onClick={onClick} postName="table" userName="john" />
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(onClick).toHaveBeenCalledTimes(1)
})
