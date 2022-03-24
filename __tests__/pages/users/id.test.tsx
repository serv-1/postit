import { render, screen } from '@testing-library/react'
import User from '../../../pages/users/[id]'

it('renders', () => {
  const user = {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/img.jpeg',
    posts: [],
  }

  render(<User user={user} />)

  const mainTitle = screen.getByRole('heading')
  expect(mainTitle).toHaveTextContent(user.name + "'s profile")

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', user.image)

  const posts = screen.getByTestId('noPosts')
  expect(posts).toHaveTextContent(user.name + ' has no posts.')
})

it('renders the user posts', () => {
  const user = {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/img.jpeg',
    posts: [
      {
        id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
        name: 'Table',
        description: 'Magnificent table',
        categories: ['furniture' as const],
        price: 50,
        images: ['/table.jpeg'],
        userId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
      },
    ],
  }

  render(<User user={user} />)

  const postsNumber = screen.getByText(user.posts.length)
  expect(postsNumber).toBeInTheDocument()

  const regex = new RegExp(user.posts[0].name, 'i')
  const post = screen.getByText(regex)
  expect(post).toBeInTheDocument()
})
