import { http, HttpResponse } from 'msw'

const handlers = [
  http.post('http://localhost/api/user', () => {
    return new HttpResponse(null, {
      status: 201,
      headers: { Location: '/profile' },
    })
  }),
  http.put('http://localhost/api/user', () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete('http://localhost/api/user', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

export default handlers
