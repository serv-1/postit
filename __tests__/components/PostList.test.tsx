import { render, screen } from '@testing-library/react'
import PostList from '../../components/PostList'

it('renders', () => {
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

  render(<PostList posts={defaultPosts} />)

  const regex = new RegExp(defaultPosts[0].name, 'i')
  const post = screen.getByText(regex)
  expect(post).toBeInTheDocument()
})
