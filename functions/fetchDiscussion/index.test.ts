import fetchDiscussion from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'

jest.mock('next-auth/react', () => ({
  getCsrfToken: async () => 'token',
}))

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('returns the discussion fetched by the given id', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({ id: '0' }))
    })
  )

  expect(await fetchDiscussion('0')).toEqual({ id: '0' })
})

it('throws an error if the server fails to fetch the discussion', async () => {
  server.use(
    rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  await expect(fetchDiscussion('0')).rejects.toThrow('error')
})
