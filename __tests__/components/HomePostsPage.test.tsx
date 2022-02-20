import { render, screen } from '@testing-library/react'
import HomePostsPage from '../../components/HomePostsPage'

test('an informative text renders if there is no posts', () => {
  render(<HomePostsPage />)

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

  render(<HomePostsPage posts={defaultPosts} />)

  const post = screen.getByText(defaultPosts[0].name)
  expect(post).toBeInTheDocument()
})

test('an informative text renders if no posts has been found', () => {
  render(<HomePostsPage posts={[]} />)

  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/no posts found/i)
})
