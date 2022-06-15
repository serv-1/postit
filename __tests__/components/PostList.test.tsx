import { render, screen } from '@testing-library/react'
import PostList from '../../components/PostList'
import { IUserPost } from '../../types/common'

const defaultPosts: Omit<IUserPost, 'user'>[] = [
  {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'Cat',
    description: 'Awesome Cat',
    categories: ['pet' as const, 'cat' as const],
    price: 50,
    images: ['LSDklsjLS.jpeg'],
    address: 'Oslo, Norway',
    latLon: [17, 22],
  },
]

it('renders', () => {
  render(<PostList posts={defaultPosts} />)

  const list = screen.getByRole('list')
  expect(list).toHaveClass('md:grid-cols-[1fr,1fr,1fr]')

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', defaultPosts[0].images[0])
})

it('renders with 2 columns', () => {
  render(<PostList posts={defaultPosts} columns={2} />)

  const list = screen.getByRole('list')
  expect(list).toHaveClass('md:grid-cols-[1fr,1fr]')
})

it('renders the image', () => {
  const post = [{ ...defaultPosts[0], image: 'image.jpeg' }]
  render(<PostList posts={post} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'image.jpeg')
})
