import { render, screen } from '@testing-library/react'
import HomePostsTotalNumber from '../../components/HomePostsTotalNumber'

test('does not render if there is no posts', () => {
  render(<HomePostsTotalNumber totalPosts={0} />)

  const number = screen.queryByRole('status')
  expect(number).not.toBeInTheDocument()
})

test('renders and display the number of posts', () => {
  render(<HomePostsTotalNumber totalPosts={5} />)

  const number = screen.getByRole('status')
  expect(number).toHaveTextContent(/5/)
})
