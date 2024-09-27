import { render, screen } from '@testing-library/react'
import ProfileUserImage from '.'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import s3Handlers from 'app/api/s3/mock'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { IMAGE_INVALID, IMAGE_TOO_BIG } from 'constants/errors'
import sendImage from 'functions/sendImage'
import Toast from 'components/Toast'

const mockSendImage = sendImage as jest.MockedFunction<typeof sendImage>
const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const server = setupServer()

jest.mock('functions/sendImage', () => ({
  __esModule: true,
  default: jest.fn(),
}))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
  mockSendImage.mockResolvedValue('key')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders an alert if the user image is updated', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return res(
        ctx.status(200),
        ctx.json({
          url: 'http://aws-presigned-url',
          fields: { a: 'a', b: 'b', c: 'c' },
          key: 'key',
        })
      )
    }),
    rest.post('http://aws-presigned-url', (req, res, ctx) => {
      return res(ctx.status(201))
    }),
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ image: 'key' })

      return res(ctx.status(204))
    })
  )

  render(
    <>
      <Toast />
      <ProfileUserImage image="img" />
    </>
  )

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/img')

  const input = screen.getByLabelText(/image/i)
  const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

  await userEvent.upload(input, file)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('The image has been updated! 🎉')
  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
})

it('can update the user image by pressing Enter while focusing it', async () => {
  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)

  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(input).toHaveFocus()
})

it('renders an error if the given file is not an image', async () => {
  render(
    <>
      <Toast />
      <ProfileUserImage image="img" />
    </>
  )

  const input = screen.getByLabelText(/image/i)
  const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })

  await userEvent.upload(input, textFile)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(IMAGE_INVALID)
})

it('renders an error if the given image is too big', async () => {
  render(
    <>
      <Toast />
      <ProfileUserImage image="img" />
    </>
  )

  const input = screen.getByLabelText(/image/i)
  const data = new Uint8Array(1_000_001).toString()
  const image = new File([data], 'image.jpg', { type: 'image/jpeg' })

  await userEvent.upload(input, image)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(IMAGE_TOO_BIG)
})

it('renders an error if the server fails to send the image', async () => {
  mockSendImage.mockRejectedValue(new Error('could not send image'))

  render(
    <>
      <Toast />
      <ProfileUserImage image="img" />
    </>
  )

  const input = screen.getByLabelText(/image/i)
  const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

  await userEvent.upload(input, file)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('could not send image')
})

it('renders an error if the server fails to update the user image', async () => {
  server.use(
    ...s3Handlers,
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: 'error' }))
    })
  )

  render(
    <>
      <Toast />
      <ProfileUserImage image="img" />
    </>
  )

  const input = screen.getByLabelText(/image/i)
  const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

  await userEvent.upload(input, file)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})
