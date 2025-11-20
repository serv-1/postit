import { render, screen } from '@testing-library/react'
import SeeAllPhotosModal from '.'
import userEvent from '@testing-library/user-event'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

it('renders', async () => {
  render(<SeeAllPhotosModal sources={['key']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  expect(closeBtn).toHaveFocus()

  const img = screen.getByRole('presentation')
  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')

  const expandBtn = screen.getByRole('button', { name: /expand/i })
  await userEvent.click(expandBtn)

  const expandedImage = screen.getAllByRole('presentation')[1]
  expect(expandedImage).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
})

it('closes', async () => {
  render(<SeeAllPhotosModal sources={['key']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})
