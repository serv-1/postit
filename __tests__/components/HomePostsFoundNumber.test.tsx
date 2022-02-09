import { render, screen } from '@testing-library/react'
import HomePostsFoundNumber from '../../components/HomePostsFoundNumber'

test('does not render if there is no posts found', () => {
  render(<HomePostsFoundNumber totalPosts={0} />)

  const number = screen.queryByRole('status')
  expect(number).not.toBeInTheDocument()
})

test('renders and display the number of posts', () => {
  render(<HomePostsFoundNumber totalPosts={5} />)

  const number = screen.getByRole('status')
  expect(number).toHaveTextContent(/5/)
})
