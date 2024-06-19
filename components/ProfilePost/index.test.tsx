import { render, screen } from '@testing-library/react'
import ProfilePost from '.'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

jest.mock('components/ProfilePostDeleteButton', () => ({
  __esModule: true,
  default: () => <button>delete</button>,
}))

it('renders correctly', () => {
  render(
    <ProfilePost
      type="default"
      id="1"
      name="post 1"
      image="post1.jpg"
      setPosts={() => {}}
    />
  )

  const link = screen.getByRole('link')

  expect(link).toHaveAttribute('href', '/posts/1/post-1')

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/post1.jpg')
  expect(image).toHaveAttribute('alt', 'post 1')

  const postName = screen.getByText(/post 1/i)

  expect(postName).toBeInTheDocument()
})
