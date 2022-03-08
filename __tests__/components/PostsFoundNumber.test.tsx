import { render, screen } from '@testing-library/react'
import PostsFoundNumber from '../../components/PostsFoundNumber'

test('renders and display the number of posts', () => {
  render(<PostsFoundNumber nb={5} />)

  const number = screen.getByRole('status')
  expect(number).toHaveTextContent(/5/)
})
