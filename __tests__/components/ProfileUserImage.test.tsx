import { render, screen, waitFor } from '@testing-library/react'
import ProfileUserImage from '../../components/ProfileUserImage'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { mockCsrfToken } from '../../mocks/nextAuth'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const axiosPut = jest.spyOn(require('axios'), 'put')

const setToast = jest.fn()
const data = { url: 'presigned url', key: 'newImg' }
const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  axiosPut
    .mockResolvedValue({})
    .mockResolvedValueOnce({ data })
    .mockResolvedValueOnce({})
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
    const calls = axiosPut.mock.calls

    expect(calls[0][1]).toEqual({ csrfToken: mockCsrfToken })
    expect(calls[1][0]).toBe(data.url)
    expect(calls[1][1]).toEqual(file)
    expect(calls[2][1]).toEqual({ csrfToken: mockCsrfToken, image: data.key })

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
  axiosPut
    .mockReset()
    .mockResolvedValue({})
    .mockRejectedValueOnce({ response: { data: { message: 'error' } } })
    .mockResolvedValueOnce({})

  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails', async () => {
  axiosPut
    .mockReset()
    .mockResolvedValue({})
    .mockResolvedValueOnce({ data })
    .mockRejectedValueOnce({ response: { data: { message: 'error' } } })

  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to update the user image', async () => {
  axiosPut
    .mockReset()
    .mockRejectedValue({ response: { data: { message: err.IMAGE_INVALID } } })
    .mockResolvedValueOnce({ data })
    .mockResolvedValueOnce({})

  render(<ProfileUserImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
