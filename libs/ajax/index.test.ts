import { http, HttpResponse } from 'msw'
import ajax from '.'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import headersToObject from 'functions/headersToObject'
// @ts-expect-error
import { mockGetCsrfToken } from 'next-auth/react'

jest.mock('next-auth/react')

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('post', () => {
  it('performs a POST request and returns its response', async () => {
    server.use(
      http.post('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 201 })
      })
    )

    expect(await ajax.post('/test')).toBeInstanceOf(Response)
  })

  it('stringifies the given data in JSON', async () => {
    const data = { name: 'john' }

    server.use(
      http.post('http://localhost/api/test', async ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({
          'content-type': 'application/json',
        })

        expect(await request.json()).toEqual(data)

        return new HttpResponse(null, { status: 201 })
      })
    )

    await ajax.post('/test', data)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      http.post('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return new HttpResponse(null, { status: 201 })
      })
    )

    await ajax.post('/test', null, { csrf: true })
  })

  it("doesn't send the csrf token if it is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      http.post('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 201 })
      })
    )

    await ajax.post('/test', null, { csrf: true })
  })
})

describe('put', () => {
  it('performs a PUT request and returns its response', async () => {
    server.use(
      http.put('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 204 })
      })
    )

    expect(await ajax.put('/test')).toBeInstanceOf(Response)
  })

  it('stringifies the given data in JSON', async () => {
    const data = { name: 'john' }

    server.use(
      http.put('http://localhost/api/test', async ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({
          'content-type': 'application/json',
        })

        expect(await request.json()).toEqual(data)

        return new HttpResponse(null, { status: 204 })
      })
    )

    await ajax.put('/test', data)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      http.put('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return new HttpResponse(null, { status: 204 })
      })
    )

    await ajax.put('/test', null, { csrf: true })
  })

  it("doesn't send the csrf token if it is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      http.put('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 204 })
      })
    )

    await ajax.put('/test', null, { csrf: true })
  })
})

describe('get', () => {
  it('performs a GET request and returns its response', async () => {
    server.use(
      http.get('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 200 })
      })
    )

    expect(await ajax.get('/test')).toBeInstanceOf(Response)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      http.get('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return new HttpResponse(null, { status: 200 })
      })
    )

    await ajax.get('/test', { csrf: true })
  })

  it("doesn't send the csrf token if it is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      http.get('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 200 })
      })
    )

    await ajax.get('/test', { csrf: true })
  })
})

describe('delete', () => {
  it('performs a DELETE request and returns its response', async () => {
    server.use(
      http.delete('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 204 })
      })
    )

    expect(await ajax.delete('/test')).toBeInstanceOf(Response)
  })

  it('sends the csrf token', async () => {
    mockGetCsrfToken.mockResolvedValue('token')

    server.use(
      http.delete('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({
          [NEXT_PUBLIC_CSRF_HEADER_NAME]: 'token',
        })

        return new HttpResponse(null, { status: 204 })
      })
    )

    await ajax.delete('/test', { csrf: true })
  })

  it("doesn't add the csrf token header if the csrf token is undefined", async () => {
    mockGetCsrfToken.mockResolvedValue(undefined)

    server.use(
      http.delete('http://localhost/api/test', ({ request }) => {
        expect(headersToObject(request.headers)).toEqual({})

        return new HttpResponse(null, { status: 204 })
      })
    )

    await ajax.delete('/test', { csrf: true })
  })
})
