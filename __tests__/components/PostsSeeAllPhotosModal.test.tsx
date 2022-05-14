import { render, screen } from '@testing-library/react'
import PostsSeeAllPhotosModal from '../../components/PostsSeeAllPhotosModal'
import userEvent from '@testing-library/user-event'

it('renders', async () => {
  render(<PostsSeeAllPhotosModal sources={['/img1']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  expect(closeBtn).toHaveFocus()

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/img1')

  const expandBtn = screen.getByRole('button', { name: /expand/i })
  await userEvent.click(expandBtn)

  const expandedImage = screen.getAllByRole('img')[1]
  expect(expandedImage).toHaveAttribute('src', '/img1')
})

it('closes', async () => {
  render(<PostsSeeAllPhotosModal sources={['/img1']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})
