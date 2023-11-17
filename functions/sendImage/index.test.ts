import sendImage from '.'
import 'cross-fetch/polyfill'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { DEFAULT, IMAGE_TOO_BIG } from 'constants/errors'

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('throws an error if it fails to generate a signed url', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  await expect(sendImage(new File([], 'image.png'))).rejects.toThrow('error')
})

it('throws an error if it fails to upload the image', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          url: 'http://cloud-storage',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.post('http://cloud-storage', (req, res, ctx) => {
      return res(ctx.status(500))
    })
  )

  await expect(sendImage(new File([], 'image.png'))).rejects.toThrow(DEFAULT)
})

it('throws an error if the image is too big to be uploaded', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          url: 'http://cloud-storage',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.post('http://cloud-storage', (req, res, ctx) => {
      return res(ctx.status(400))
    })
  )

  await expect(sendImage(new File([], 'image.png'))).rejects.toThrow(
    IMAGE_TOO_BIG
  )
})

it('returns the key of the uploaded image', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          url: 'http://cloud-storage',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.post('http://cloud-storage', (req, res, ctx) => {
      return res(ctx.status(201))
    })
  )

  expect(await sendImage(new File([], 'image.png'))).toBe('key')
})
