import sendImage from '.'
import { http, HttpResponse } from 'msw'
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
    http.get('http://localhost/api/s3', ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  await expect(sendImage(new File([], 'image.png'))).rejects.toThrow('error')
})

it('throws an error if it fails to upload the image', async () => {
  server.use(
    http.get('http://localhost/api/s3', () => {
      return HttpResponse.json(
        {
          url: 'http://cloud-storage',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        },
        { status: 200 }
      )
    }),
    http.post('http://cloud-storage', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  await expect(sendImage(new File([], 'image.png'))).rejects.toThrow(DEFAULT)
})

it('throws an error if the image is too big to be uploaded', async () => {
  server.use(
    http.get('http://localhost/api/s3', () => {
      return HttpResponse.json(
        {
          url: 'http://cloud-storage',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        },
        { status: 200 }
      )
    }),
    http.post('http://cloud-storage', () => {
      return new HttpResponse(null, { status: 400 })
    })
  )

  await expect(sendImage(new File([], 'image.png'))).rejects.toThrow(
    IMAGE_TOO_BIG
  )
})

it('returns the key of the uploaded image', async () => {
  server.use(
    http.get('http://localhost/api/s3', () => {
      return HttpResponse.json(
        {
          url: 'http://cloud-storage',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        },
        { status: 200 }
      )
    }),
    http.post('http://cloud-storage', () => {
      return new HttpResponse(null, { status: 201 })
    })
  )

  expect(await sendImage(new File([], 'image.png'))).toBe('key')
})
