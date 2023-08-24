import { render, screen } from '@testing-library/react'
import SeeAllPhotosModal from '.'
import userEvent from '@testing-library/user-event'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

it('renders', async () => {
  render(<SeeAllPhotosModal sources={['keyName']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  expect(closeBtn).toHaveFocus()

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', awsUrl + 'keyName')

  const expandBtn = screen.getByRole('button', { name: /expand/i })
  await userEvent.click(expandBtn)

  const expandedImage = screen.getAllByRole('img')[1]
  expect(expandedImage).toHaveAttribute('src', awsUrl + 'keyName')
})

it('closes', async () => {
  render(<SeeAllPhotosModal sources={['keyName']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})
