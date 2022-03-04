import { render, screen } from '@testing-library/react'
import PostList from '../../components/PostList'

test('an informative text renders if there is no posts', () => {
  render(<PostList />)

  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/search something/i)
})

test('the posts render', () => {
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

test('an informative text renders if no posts has been found', () => {
  render(<PostList posts={[]} />)

  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/no posts found/i)
})
