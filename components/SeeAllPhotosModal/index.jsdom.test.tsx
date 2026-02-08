import { screen } from '@testing-library/react'
import SeeAllPhotosModal from '.'
import setup from 'functions/setup'

vi.mock('next/image')

it('is closed by default', () => {
  setup(<SeeAllPhotosModal sources={['key']} />)

  const modal = screen.queryByRole('dialog')
  expect(modal).not.toBeInTheDocument()
})

it('opens and closes', async () => {
  const { user } = setup(<SeeAllPhotosModal sources={['key']} />)

  const openBtn = screen.getByRole('button')
  await user.click(openBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await user.click(closeBtn)

  expect(modal).not.toBeInTheDocument()
})

it('renders the photos', async () => {
  const { user } = setup(<SeeAllPhotosModal sources={['img1', 'img2']} />)

  const openBtn = screen.getByRole('button')
  await user.click(openBtn)

  const photos = screen.getAllByRole('presentation')
  expect(photos).toHaveLength(2)
})
