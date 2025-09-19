import { http, HttpResponse } from 'msw'

const handlers = [
  http.put('http://localhost/api/posts/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete('http://localhost/api/posts/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

export default handlers
