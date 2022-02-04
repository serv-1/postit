import { render, screen } from '@testing-library/react'
import HomePostsFoundNumber from '../../components/HomePostsFoundNumber'

const factory = (totalPosts = 0) => {
  render(<HomePostsFoundNumber totalPosts={totalPosts} />)
}

test('does not render if there is no posts found', () => {
  factory()

  const number = screen.queryByRole('status')
  expect(number).not.toBeInTheDocument()
})

test('renders and display the number of posts', () => {
  factory(5)

  const number = screen.getByRole('status')
  expect(number).toHaveTextContent(/5/)
})
