import { render, screen } from '@testing-library/react'
import Post from '../../../../pages/posts/[id]/[name]'
import { IPost } from '../../../../types/common'

const post: IPost = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Table',
  description: 'Magnificent table',
  categories: ['furniture' as const],
  price: 5000.12,
  images: ['/table.jpeg'],
  user: {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'John Doe',
    email: 'johndoe@test.com',
    image: '/static/images/default.jpg',
    posts: [],
  },
}

it('renders', () => {
  render(<Post post={post} />)

  const mainTitle = screen.getByRole('heading', { level: 1 })
  expect(mainTitle).toHaveTextContent(post.name)

  const category = screen.getByText(post.categories[0])
  expect(category).toBeInTheDocument()

  const price = screen.getByText('5,000.12€')
  expect(price).toBeInTheDocument()

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/table.jpeg')

  const username = screen.getByRole('link')
  expect(username).toHaveTextContent(post.user.name)
  expect(username).toHaveAttribute('href', '/users/' + post.user.id)
  expect(username).toHaveAttribute('title', post.user.name + "'s profile")

  const description = screen.getByText(post.description)
  expect(description).toBeInTheDocument()

  const userOtherPostsTitle = screen.queryByRole('heading', { level: 2 })
  expect(userOtherPostsTitle).not.toBeInTheDocument()
})

it('renders the user other posts', () => {
  const p = { ...post }

  p.user.posts.push({
    name: 'Chair',
    price: 25,
    image: '/static/images/posts/chair.jpeg',
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  })

  render(<Post post={post} />)

  const userOtherPostsTitle = screen.getByRole('heading', { level: 2 })
  expect(userOtherPostsTitle).toHaveTextContent(p.user.name + "'s other posts")

  const postName = screen.getByText(p.user.posts[0].name + ' →')
  expect(postName).toBeInTheDocument()
})
