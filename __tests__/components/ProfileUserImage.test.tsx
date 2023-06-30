import { render, screen, waitFor } from '@testing-library/react'
import ProfileUserImage from '../../components/ProfileUserImage'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { mockCsrfToken } from '../../mocks/nextAuth'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const axiosPost = jest.spyOn(require('axios'), 'post')
const axiosPut = jest.spyOn(require('axios'), 'put')
const axiosGet = jest.spyOn(require('axios'), 'get')

const setToast = jest.fn()
const data = { url: 'signed url', key: 'newImg', fields: {} }
const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

beforeEach(() => {
  useToastMock.mockReturnValue({ setToast, toast: {} })
  axiosGet.mockResolvedValue({ data })
  axiosPut.mockResolvedValue({})
  axiosPost.mockResolvedValue({})
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

test('an alert renders if the user image is updated and the new user image renders', async () => {
  render(<ProfileUserImage image="img" />)

  const image = screen.getByRole('img')
  expect(image).toHaveAttribute('src', awsUrl + 'img')

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const url = '/api/s3?csrfToken=' + mockCsrfToken
    expect(axiosGet).toHaveBeenNthCalledWith(1, url)
  })

  await waitFor(() => {
    const formData = new FormData()
    formData.append('file', file)
    expect(axiosPost).toHaveBeenNthCalledWith(1, data.url, formData)
  })

  await waitFor(() => {
    const payload = { csrfToken: mockCsrfToken, image: data.key }
    expect(axiosPut).toHaveBeenNthCalledWith(1, '/api/user', payload)
  })

  await waitFor(() => {
    expect(setToast).toHaveNthReturnedWith(1, undefined)
  })

  expect(image).toHaveAttribute('src', awsUrl + data.key)
})

test('the user image can be updated by pressing Enter while focusing it', async () => {
  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)

  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(input).toHaveFocus()
})

test('an error renders if the user image is not an image', async () => {
  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
  await userEvent.upload(input, textFile)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the user image is too big', async () => {
  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  const data = new Uint8Array(1_000_001).toString()
  const image = new File([data], 'image.jpg', { type: 'image/jpeg' })
  await userEvent.upload(input, image)

  await waitFor(() => {
    const toast = { message: err.IMAGE_TOO_BIG, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to fetch the presigned url', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails because the image is too big', async () => {
  axiosPost.mockRejectedValue({ response: { status: 400, data: 'xml' } })

  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: err.IMAGE_TOO_BIG, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails', async () => {
  axiosPost.mockRejectedValue({ response: { status: 403, data: 'xml' } })

  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to update the user image', async () => {
  axiosPut.mockRejectedValue({
    response: { data: { message: err.IMAGE_INVALID } },
  })

  render(<ProfileUserImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
