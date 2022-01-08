import { render, screen, waitFor } from '@testing-library/react'
import UpdateImage from '../../components/UpdateImage'
import { ToastProvider } from '../../contexts/toast'
import userEvent from '@testing-library/user-event'
import { mockSession } from '../../mocks/nextAuth'
import { SessionProvider } from 'next-auth/react'
import { mockResponse } from '../../utils/msw'
import Toast from '../../components/Toast'
import err from '../../utils/errors'
import axios from 'axios'

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

const reader = new FileReader()
let base64Uri: string
reader.onload = (e) => {
  base64Uri = e.target?.result as string
}
reader.readAsDataURL(file)

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <ToastProvider>
        <UpdateImage />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  )
}

const axiosGet = axios.get
const axiosPut = axios.put

afterEach(() => {
  axios.get = axiosGet
  axios.put = axiosPut
})

describe('UpdateImage', () => {
  describe('API call', () => {
    it('should render an error if the image cannot be obtained', async () => {
      mockResponse('get', '/api/users/:id', 404, {
        message: err.IMAGE_NOT_FOUND,
      })
      factory()
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.IMAGE_NOT_FOUND)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server did not respond while fetching the user', async () => {
      axios.get = jest.fn().mockRejectedValueOnce({})
      factory()
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NO_RESPONSE)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server did not respond while updating the user', async () => {
      axios.put = jest.fn().mockRejectedValueOnce({})
      factory()
      userEvent.upload(screen.getByTestId('fileInput'), file)
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.NO_RESPONSE)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the server failed to update the user', async () => {
      mockResponse('put', '/api/users/:id', 422, {
        message: err.USER_IMAGE_INVALID,
      })
      factory()
      userEvent.upload(screen.getByTestId('fileInput'), file)
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.USER_IMAGE_INVALID)
      expect(toast).toHaveClass('bg-danger')
    })
  })

  describe('button', () => {
    it('should contain user image', async () => {
      factory()
      expect(await screen.findByRole('img')).toBeInTheDocument()
    })

    it('should trigger a click on the file input on click', async () => {
      factory()
      const click = jest.fn()
      screen.getByTestId('fileInput').click = click
      userEvent.click(screen.getByRole('button'))
      expect(click).toHaveBeenCalledTimes(1)
      await screen.findByRole('img') // avoid memory leak
    })

    it('should render the uploaded image with a successful message', async () => {
      factory()
      await screen.findByRole('img')
      userEvent.upload(screen.getByTestId('fileInput'), file)
      expect(await screen.findByRole('alert')).toHaveClass('bg-success')
      await waitFor(() =>
        expect(screen.getByRole('img')).toHaveAttribute('src', base64Uri)
      )
    })
  })

  describe('file input', () => {
    it('should render an error if the file is not an image', async () => {
      factory()
      await screen.findByRole('img')
      const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
      userEvent.upload(screen.getByTestId('fileInput'), textFile)
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.USER_IMAGE_INVALID)
      expect(toast).toHaveClass('bg-danger')
    })

    it('should render an error if the file is too large', async () => {
      factory()
      await screen.findByRole('img')
      const buffer = new ArrayBuffer(1000001)
      const tooLargeFile = new File([buffer], file.name, { type: file.type })
      userEvent.upload(screen.getByTestId('fileInput'), tooLargeFile)
      const toast = await screen.findByRole('alert')
      expect(toast).toHaveTextContent(err.USER_IMAGE_TOO_LARGE)
      expect(toast).toHaveClass('bg-danger')
    })
  })
})
