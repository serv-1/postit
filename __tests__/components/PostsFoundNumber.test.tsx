import { render, screen } from '@testing-library/react'
import PostsFoundNumber from '../../components/PostsFoundNumber'

test('does not render if there is no posts', () => {
  render(<PostsFoundNumber nb={0} />)

  const number = screen.queryByRole('status')
  expect(number).not.toBeInTheDocument()
})

test('renders and display the number of posts', () => {
  render(<PostsFoundNumber nb={5} />)

  const number = screen.getByRole('status')
  expect(number).toHaveTextContent(/5/)
})
