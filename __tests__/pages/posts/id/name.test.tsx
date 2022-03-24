import { render, screen } from '@testing-library/react'
import Post from '../../../../pages/posts/[id]/[name]'

it('renders', () => {
  const post = {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'Table',
    description: 'Magnificent table',
    categories: ['furniture' as const],
    price: 5000.12,
    images: ['/img.jpeg'],
    user: {
      id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
      name: 'John Doe',
      email: 'johndoe@test.com',
      image: '/static/images/default.jpg',
      posts: [],
    },
  }

  render(<Post post={post} />)

  const mainTitle = screen.getByRole('heading')
  expect(mainTitle).toHaveTextContent(post.name)

  const category = screen.getByText(post.categories[0])
  expect(category).toBeInTheDocument()

  const price = screen.getByText('5,000.12€')
  expect(price).toBeInTheDocument()

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/img.jpeg')

  const username = screen.getByRole('link')
  expect(username).toHaveTextContent(post.user.name)
  expect(username).toHaveAttribute('href', '/users/' + post.user.id)
  expect(username).toHaveAttribute('title', post.user.name + "'s profile")

  const description = screen.getByText(post.description)
  expect(description).toBeInTheDocument()
})
