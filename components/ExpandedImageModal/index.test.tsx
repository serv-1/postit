import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpandedImageModal from '.'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

it('renders', async () => {
  render(<ExpandedImageModal src="key" btnClass="red" btnImgClass="blue" />)

  const img = screen.getByRole('presentation')
  expect(img).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
  expect(img).toHaveClass('blue')

  const openBtn = screen.getByRole('button')
  expect(openBtn).toHaveClass('red')
  await userEvent.click(openBtn)

  const expandedImg = screen.getAllByRole('presentation')[1]
  expect(expandedImg).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
})

it('closes', async () => {
  render(<ExpandedImageModal src="key" />)

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})
