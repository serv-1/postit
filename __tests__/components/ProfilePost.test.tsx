import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePost from '../../components/ProfilePost'

const post = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Table',
  description: 'Magnificent table',
  categories: ['furniture' as const],
  price: 50,
  images: ['static/images/post/table.jpeg'],
  userId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
}

test('the edit button opens the update post modal', () => {
  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  const modalTitle = screen.getByRole('heading')
  expect(modalTitle).toBeInTheDocument()
})
