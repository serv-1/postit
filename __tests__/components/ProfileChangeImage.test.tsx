import { render, screen, waitFor } from '@testing-library/react'
import ProfileChangeImage from '../../components/ProfileChangeImage'
import { ToastProvider } from '../../contexts/toast'
import userEvent from '@testing-library/user-event'
import { mockSession } from '../../mocks/nextAuth'
import { SessionProvider } from 'next-auth/react'
import { mockResponse } from '../../lib/msw'
import Toast from '../../components/Toast'
import err from '../../utils/constants/errors'

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <ProfileChangeImage />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

test('the button trigger a click on the file input', async () => {
  factory()

  await screen.findByRole('img')

  const input = screen.getByTestId('fileInput')
  const click = jest.fn()
  input.click = click

  const btn = screen.getByRole('button')
  userEvent.click(btn)
  expect(click).toHaveBeenCalledTimes(1)
})

test('the user image is updated and rendered in the button and a successful message renders', async () => {
  factory()

  const img = await screen.findByRole('img')
  const imgsrc = img.getAttribute('src')

  const input = screen.getByTestId('fileInput')
  userEvent.upload(input, file)

  const _img = screen.getByRole('img')
  await waitFor(() => expect(imgsrc).not.toBe(_img.getAttribute('src')))

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveClass('bg-success')
})

test('an error renders if the user image is invalid', async () => {
  factory()

  await screen.findByRole('img')

  const input = screen.getByTestId('fileInput')
  const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
  userEvent.upload(input, textFile)

  let toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_INVALID)
  expect(toast).toHaveClass('bg-danger')

  const buffer = new ArrayBuffer(1000001)
  const tooLargeFile = new File([buffer], file.name, { type: file.type })
  userEvent.upload(input, tooLargeFile)

  toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_TOO_LARGE)
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to fetch the user image', async () => {
  mockResponse('get', '/api/users/:id', 404, { message: err.IMAGE_NOT_FOUND })

  factory()

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_NOT_FOUND)
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to update the user image', async () => {
  mockResponse('put', '/api/users/:id', 422, {
    message: err.IMAGE_INVALID,
  })

  factory()

  await screen.findByRole('img')

  const input = screen.getByTestId('fileInput')
  userEvent.upload(input, file)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.IMAGE_INVALID)
  expect(toast).toHaveClass('bg-danger')
})
