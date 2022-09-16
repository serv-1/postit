import { render, screen } from '@testing-library/react'
import PostList from '../../components/PostList'

const defaultPosts = [
  {
    id: '0',
    name: 'Cat',
    price: 40,
    image: 'cat.jpeg',
    address: 'Oslo, Norway',
  },
]

it('renders', () => {
  render(<PostList posts={defaultPosts} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', defaultPosts[0].image)
})

it('renders the image', () => {
  const post = [{ ...defaultPosts[0], image: 'image.jpeg' }]
  render(<PostList posts={post} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'image.jpeg')
})
