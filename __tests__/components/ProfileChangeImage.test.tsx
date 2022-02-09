import { render, screen, waitFor } from '@testing-library/react'
import ProfileChangeImage from '../../components/ProfileChangeImage'
import { ToastProvider } from '../../contexts/toast'
import userEvent from '@testing-library/user-event'
import { mockSession } from '../../mocks/nextAuth'
import Toast from '../../components/Toast'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

const factory = (image?: string) => {
  render(
    <ToastProvider>
      <ProfileChangeImage id={mockSession.id} image={image} />
      <Toast />
    </ToastProvider>
  )
}

test('no image renders if there is no image', () => {
  factory()

  const img = screen.queryByRole('img')
  expect(img).not.toBeInTheDocument()
})

test('the button trigger a click on the file input', () => {
  factory()

  const input = screen.getByTestId('fileInput')
  const click = jest.fn()
  input.click = click

  const btn = screen.getByRole('button')
  userEvent.click(btn)
  expect(click).toHaveBeenCalledTimes(1)
})

test('an alert renders if the user image is updated and the new user image renders', async () => {
  factory('base64Uri')

  const oldImg = screen.getByRole('img')
  const oldSrc = oldImg.getAttribute('src')

  const input = screen.getByTestId('fileInput')
  userEvent.upload(input, file)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveClass('bg-success')

  const newImg = screen.getByRole('img')
  const newSrc = newImg.getAttribute('src')

  await waitFor(() => {
    expect(newSrc).not.toBe(oldSrc)
  })
})

test('an error renders if the user image is invalid', async () => {
  factory()

  const input = screen.getByTestId('fileInput')
  const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
  userEvent.upload(input, textFile)

  let toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_INVALID)
  expect(toast).toHaveClass('bg-danger')

  const data = new ArrayBuffer(1000001)
  const tooLargeFile = new File([data], file.name, { type: file.type })
  userEvent.upload(input, tooLargeFile)

  toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_TOO_LARGE)
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to update the user image', async () => {
  server.use(
    rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.IMAGE_INVALID }))
    })
  )

  factory()

  const input = screen.getByTestId('fileInput')
  userEvent.upload(input, file)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_INVALID)
  expect(toast).toHaveClass('bg-danger')
})
