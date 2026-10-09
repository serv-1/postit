import { http, HttpResponse } from 'msw'
import type { Discussion } from 'types'

const handlers = [
  http.get('api/discussions/:id', () => {
    return HttpResponse.json<Discussion>(
      {
        _id: '0',
        post: {
          id: '0',
          name: 'table',
        },
        messages: [
          {
            _id: '0',
            message: 'yo',
            createdAt: new Date().toString(),
            userId: '0',
            seen: false,
          },
        ],
        buyerId: '0',
        sellerId: '1',
      },
      { status: 200 },
    )
  }),
  http.put('api/discussions/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete('api/discussions/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

export default handlers
