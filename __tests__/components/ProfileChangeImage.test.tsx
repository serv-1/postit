import { render, screen, waitFor } from '@testing-library/react'
import ProfileChangeImage from '../../components/ProfileChangeImage'
import userEvent from '@testing-library/user-event'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeEach(() => useToast.mockReturnValue({}))

test('no image renders if there is no image', () => {
  render(<ProfileChangeImage id={mockSession.id} />)

  const img = screen.queryByRole('img')
  expect(img).not.toBeInTheDocument()
})

test('the button trigger a click on the file input', () => {
  render(<ProfileChangeImage id={mockSession.id} />)

  const input = screen.getByTestId('fileInput')
  const click = jest.fn()
  input.click = click

  const btn = screen.getByRole('button')
  userEvent.click(btn)
  expect(click).toHaveBeenCalledTimes(1)
})

test('an alert renders if the user image is updated and the new user image renders', async () => {
  type Update = { message: string; background: string }
  const setToast = jest.fn((update: Update) => update.background)
  useToast.mockReturnValue({ setToast })

  render(<ProfileChangeImage id={mockSession.id} image="base64Uri" />)

  const oldImg = screen.getByRole('img')
  const oldSrc = oldImg.getAttribute('src')

  const input = screen.getByTestId('fileInput')
  userEvent.upload(input, file)

  await waitFor(() => expect(setToast).toHaveNthReturnedWith(1, 'success'))

  const newImg = screen.getByRole('img')
  const newSrc = newImg.getAttribute('src')

  await waitFor(() => {
    expect(newSrc).not.toBe(oldSrc)
  })
})

test('an error renders if the user image is invalid', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  render(<ProfileChangeImage id={mockSession.id} />)

  const input = screen.getByTestId('fileInput')
  const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
  userEvent.upload(input, textFile)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })

  const data = new ArrayBuffer(1000001)
  const tooLargeFile = new File([data], file.name, { type: file.type })
  userEvent.upload(input, tooLargeFile)

  await waitFor(() => {
    const toast = { message: err.IMAGE_TOO_LARGE, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(2, toast)
  })
})

test('an error renders if the server fails to update the user image', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.IMAGE_INVALID }))
    })
  )

  render(<ProfileChangeImage id={mockSession.id} />)

  const input = screen.getByTestId('fileInput')
  userEvent.upload(input, file)

  await waitFor(() => {
    const toast = { message: err.IMAGE_INVALID, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
