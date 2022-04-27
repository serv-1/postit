import { render, screen } from '@testing-library/react'
import PostsSeeAllPhotosModal from '../../components/PostsSeeAllPhotosModal'
import userEvent from '@testing-library/user-event'

it('renders', async () => {
  render(<PostsSeeAllPhotosModal images={['/img1']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const originalSizeBtn = screen.getByRole('button', { name: /original/i })
  expect(originalSizeBtn).toHaveFocus()
  expect(originalSizeBtn).toHaveAttribute('id', 'image0Opener')

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', '/img1')

  await userEvent.click(originalSizeBtn)

  const expandedImage = screen.getAllByRole('img')[1]
  expect(expandedImage).toHaveAttribute('src', '/img1')
})

test('the modals close', async () => {
  render(<PostsSeeAllPhotosModal images={['/img1']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  const originalSizeBtn = screen.getByRole('button', { name: /original/i })
  await userEvent.click(originalSizeBtn)

  let closeBtns = screen.getAllByRole('button', { name: /close/i })
  await userEvent.click(closeBtns[1])

  const modals = screen.getAllByRole('dialog')
  expect(modals).toHaveLength(1)

  await userEvent.click(closeBtns[0])
  expect(modals[0]).not.toBeInTheDocument()
})

test('the focus is trapped in each modals', async () => {
  render(<PostsSeeAllPhotosModal images={['/img1', '/img2']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  await userEvent.tab({ shift: true })
  await userEvent.tab({ shift: true })

  const originalSizeBtns = screen.getAllByRole('button', { name: /original/i })
  expect(originalSizeBtns[1]).toHaveFocus()

  await userEvent.tab()

  let closeBtn = screen.getByRole('button', { name: /close/i })
  expect(closeBtn).toHaveFocus()

  await userEvent.click(originalSizeBtns[0])
  await userEvent.tab()

  closeBtn = screen.getAllByRole('button', { name: /close/i })[1]
  expect(closeBtn).toHaveFocus()

  await userEvent.tab({ shift: true })
  expect(closeBtn).toHaveFocus()
})

it('stop the "click" event to propagate when it is unnecessary', async () => {
  const docOnClick = jest.fn()
  render(<PostsSeeAllPhotosModal images={['/img1']} />)

  const photosBtn = screen.getByRole('button', { name: /photos/i })
  await userEvent.click(photosBtn)

  document.addEventListener('click', docOnClick)

  const originalSizeBtn = screen.getByRole('button', { name: /original/i })
  await userEvent.click(originalSizeBtn)
  expect(docOnClick).not.toHaveBeenCalled()

  const closeBtns = screen.getAllByRole('button', { name: /close/i })
  await userEvent.click(closeBtns[1])
  expect(docOnClick).not.toHaveBeenCalled()

  await userEvent.click(closeBtns[0])
  expect(docOnClick).not.toHaveBeenCalled()

  document.removeEventListener('click', docOnClick)
})
