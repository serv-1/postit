import { rest } from 'msw'
import ajax from '.'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('post', () => {
  it('performs a POST request and returns its response', async () => {
    server.use(
      rest.post('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(201))
      })
    )

    expect(await ajax.post('/test')).toBeInstanceOf(Response)
  })

  it('stringifies the given data in JSON', async () => {
    const data = { name: 'john' }

    server.use(
      rest.post('http://localhost/api/test', async (req, res, ctx) => {
        expect(req.headers.all()).toEqual({
          'content-type': 'application/json',
        })

        expect(await req.json()).toEqual(data)

        return res(ctx.status(201))
      })
    )

    await ajax.post('/test', data)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      rest.post('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return res(ctx.status(201))
      })
    )

    await ajax.post('/test', null, { csrf: true })
  })

  it("doesn't send the csrf token if it is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      rest.post('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(201))
      })
    )

    await ajax.post('/test', null, { csrf: true })
  })
})

describe('put', () => {
  it('performs a PUT request and returns its response', async () => {
    server.use(
      rest.put('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(204))
      })
    )

    expect(await ajax.put('/test')).toBeInstanceOf(Response)
  })

  it('stringifies the given data in JSON', async () => {
    const data = { name: 'john' }

    server.use(
      rest.put('http://localhost/api/test', async (req, res, ctx) => {
        expect(req.headers.all()).toEqual({
          'content-type': 'application/json',
        })

        expect(await req.json()).toEqual(data)

        return res(ctx.status(204))
      })
    )

    await ajax.put('/test', data)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      rest.put('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return res(ctx.status(204))
      })
    )

    await ajax.put('/test', null, { csrf: true })
  })

  it("doesn't send the csrf token if it is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      rest.put('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(204))
      })
    )

    await ajax.put('/test', null, { csrf: true })
  })
})

describe('get', () => {
  it('performs a GET request and returns its response', async () => {
    server.use(
      rest.get('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(200))
      })
    )

    expect(await ajax.get('/test')).toBeInstanceOf(Response)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      rest.get('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return res(ctx.status(200))
      })
    )

    await ajax.get('/test', { csrf: true })
  })

  it("doesn't send the csrf token if it is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      rest.get('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(200))
      })
    )

    await ajax.get('/test', { csrf: true })
  })
})

describe('delete', () => {
  it('performs a DELETE request and returns its response', async () => {
    server.use(
      rest.delete('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(204))
      })
    )

    expect(await ajax.delete('/test')).toBeInstanceOf(Response)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      rest.delete('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return res(ctx.status(204))
      })
    )

    await ajax.delete('/test', { csrf: true })
  })

  it("doesn't add the csrf token header if the csrf token is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      rest.delete('http://localhost/api/test', (req, res, ctx) => {
        expect(req.headers.all()).toEqual({})

        return res(ctx.status(204))
      })
    )

    await ajax.delete('/test', { csrf: true })
  })
})
