import fetchDiscussion from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
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
    http.get('http://localhost/api/discussions/:id', ({ request, params }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(params.id).toBe('0')

      return HttpResponse.json({ id: '0' }, { status: 200 })
    })
  )

  expect(await fetchDiscussion('0')).toEqual({ id: '0' })
})

it('throws an error if the server fails to fetch the discussion', async () => {
  server.use(
    http.get('http://localhost/api/discussions/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  await expect(fetchDiscussion('0')).rejects.toThrow('error')
})
