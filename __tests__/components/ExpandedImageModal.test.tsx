import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpandedImageModal from '../../components/ExpandedImageModal'

it('renders', async () => {
  render(<ExpandedImageModal src="/img" btnClass="red" btnImgClass="blue" />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/img')
  expect(img).toHaveClass('blue')

  const openBtn = screen.getByRole('button')
  expect(openBtn).toHaveClass('red')
  await userEvent.click(openBtn)

  const expandedImg = screen.getAllByRole('img')[1]
  expect(expandedImg).toHaveAttribute('src', '/img')
})

it('closes', async () => {
  render(<ExpandedImageModal src="/img" />)

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})
