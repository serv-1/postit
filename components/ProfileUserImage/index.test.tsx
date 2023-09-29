import { render, screen, waitFor } from '@testing-library/react'
import ProfileUserImage from '.'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import s3Handlers from 'app/api/s3/mock'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { IMAGE_INVALID, IMAGE_TOO_BIG, DEFAULT } from 'constants/errors'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const server = setupServer()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
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

  render(<ProfileUserImage image="img" />)

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/img')

  const input = screen.getByLabelText(/image/i)
  const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

  await userEvent.upload(input, file)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'The image has been updated! 🎉',
    })
  })

  await waitFor(() => {
    expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')
  })
})

it('can update the user image by pressing Enter while focusing it', async () => {
  render(<ProfileUserImage image="img" />)

  const input = screen.getByLabelText(/image/i)

  await userEvent.tab()
  await userEvent.keyboard('{Enter}')

  expect(input).toHaveFocus()
})

describe('renders an error if', () => {
  test('the given file is not an image', async () => {
    render(<ProfileUserImage image="img" />)

    const input = screen.getByLabelText(/image/i)
    const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })

    await userEvent.upload(input, textFile)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: IMAGE_INVALID,
        error: true,
      })
    })
  })

  test('the given image is too big', async () => {
    render(<ProfileUserImage image="img" />)

    const input = screen.getByLabelText(/image/i)
    const data = new Uint8Array(1_000_001).toString()
    const image = new File([data], 'image.jpg', { type: 'image/jpeg' })

    await userEvent.upload(input, image)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: IMAGE_TOO_BIG,
        error: true,
      })
    })
  })

  test('the server fails to fetch the presigned url', async () => {
    server.use(
      rest.get('http://localhost/api/s3', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'error' }))
      })
    )

    render(<ProfileUserImage image="img" />)

    const input = screen.getByLabelText(/image/i)
    const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })

  test('the request to the presigned url fails', async () => {
    server.use(
      rest.get('http://localhost/api/s3', (req, res, ctx) => {
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
        return res(ctx.status(422))
      })
    )

    render(<ProfileUserImage image="img" />)

    const input = screen.getByLabelText(/image/i)
    const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: DEFAULT,
        error: true,
      })
    })
  })

  test('the server fails to update the user image', async () => {
    server.use(
      ...s3Handlers,
      rest.put('http://localhost/api/user', (req, res, ctx) => {
        return res(ctx.status(422), ctx.json({ message: 'error' }))
      })
    )

    render(<ProfileUserImage image="img" />)

    const input = screen.getByLabelText(/image/i)
    const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenNthCalledWith(1, {
        message: 'error',
        error: true,
      })
    })
  })
})
