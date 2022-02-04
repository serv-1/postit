import { render, screen } from '@testing-library/react'
import HomePostsPage from '../../components/HomePostsPage'
import { Post } from '../../types/common'

const defaultPosts = [
  {
    id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
    name: 'Cat',
    description: 'Awesome Cat',
    categories: ['pet', 'cat'],
    price: 50,
    images: ['data:image/jpeg;base64,base64='],
    userId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
  },
]

const factory = (posts?: Post[]) => {
  render(<HomePostsPage posts={posts} />)
}

test('an informative text renders if there is no posts', () => {
  factory()

  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/search something/i)
})

test('the posts render', () => {
  factory(defaultPosts)

  const post = screen.getByText(defaultPosts[0].name)
  expect(post).toBeInTheDocument()
})

test('an informative text renders if no posts has been found', () => {
  factory([])

  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/no posts found/i)
})
