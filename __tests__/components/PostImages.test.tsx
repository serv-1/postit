import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostImages from '../../components/PostImages'

/** images[0] is the selected image */

test('images render', () => {
  render(<PostImages images={['/img1', '/img2', '/img3']} />)

  const images = screen.getAllByRole('img')

  expect(images[0]).toHaveAttribute('src', '/img1')
  expect(images[1]).toHaveAttribute('src', '/img1')
  expect(images[2]).toHaveAttribute('src', '/img2')
  expect(images[3]).toHaveAttribute('src', '/img3')
})

test('clicking an image select it', async () => {
  render(<PostImages images={['/img1', '/img2', '/img3']} />)

  const images = screen.getAllByRole('img')

  userEvent.click(images[2])

  expect(images[0]).toHaveAttribute('src', '/img2')
})

test('only 1 image render', () => {
  render(<PostImages images={['/img1']} />)

  const images = screen.getAllByRole('img')

  expect(images).toHaveLength(1)
})

test('if the given images are updated then the default selected image is updated too', () => {
  const { rerender } = render(<PostImages images={['/img1']} />)

  let selectedImage = screen.getByRole('img')

  expect(selectedImage).toHaveAttribute('src', '/img1')

  rerender(<PostImages images={['/img2']} />)

  selectedImage = screen.getByRole('img')

  expect(selectedImage).toHaveAttribute('src', '/img2')
})
