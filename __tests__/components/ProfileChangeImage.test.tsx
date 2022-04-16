import { render, screen, waitFor } from '@testing-library/react'
import ProfileChangeImage from '../../components/ProfileChangeImage'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'
import { ToastState } from '../../contexts/toast'
import readAsDataUrl from '../../utils/functions/readAsDataUrl'

jest.mock('../../utils/functions/readAsDataUrl')

const mockReadAsDataUrl = readAsDataUrl as jest.MockedFunction<
  typeof readAsDataUrl
>

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeEach(() => useToast.mockReturnValue({}))
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

test('the button triggers a click on the file input', async () => {
  render(<ProfileChangeImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  const click = jest.fn()
  input.click = click

  const btn = screen.getByRole('button')
  await userEvent.click(btn)
  expect(click).toHaveBeenCalledTimes(1)
})

test('an alert renders if the user image is updated and the new user image renders', async () => {
  const setToast = jest.fn((update: ToastState) => update.error)
  useToast.mockReturnValue({ setToast })

  mockReadAsDataUrl.mockResolvedValue({ base64: 'slfjsl', ext: 'jpeg' })

  render(<ProfileChangeImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    expect(setToast).toHaveNthReturnedWith(1, undefined)
  })

  const image = screen.getByRole('img')
  expect(image).not.toHaveAttribute('src', '/img')
})

test('an error renders if the user image is invalid', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  render(<ProfileChangeImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
  await userEvent.upload(input, textFile)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the image cannot be read as data url', async () => {
  mockReadAsDataUrl.mockResolvedValue('error')

  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  render(<ProfileChangeImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to update the user image', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.put('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.IMAGE_INVALID }))
    })
  )

  render(<ProfileChangeImage image="/img" />)

  const input = screen.getByLabelText(/image/i)
  await userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
