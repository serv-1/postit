import { render, screen } from '@testing-library/react'
import PostList from '../../components/PostList'

const defaultPosts = [
  {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'Cat',
    description: 'Awesome Cat',
    categories: ['pet' as const, 'cat' as const],
    price: 50,
    images: ['LSDklsjLS.jpeg'],
    userId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
  },
]

it('renders', () => {
  render(<PostList posts={defaultPosts} />)

  const list = screen.getByRole('list')
  expect(list).toHaveClass('md:grid-cols-[1fr,1fr,1fr]')

  const post = screen.getByText(/cat/i)
  expect(post).toBeInTheDocument()
})

it('renders with 2 columns', () => {
  render(<PostList posts={defaultPosts} columns={2} />)

  const list = screen.getByRole('list')
  expect(list).toHaveClass('md:grid-cols-[1fr,1fr]')
})
