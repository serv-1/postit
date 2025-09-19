import { http, HttpResponse } from 'msw'
import type { Discussion } from 'types'

const handlers = [
  http.get('http://localhost/api/discussions/:id', () => {
    return HttpResponse.json<Discussion>(
      {
        _id: '0',
        postId: '0',
        postName: 'table',
        channelName: 'channel name',
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
        hasNewMessage: false,
      },
      { status: 200 }
    )
  }),
  http.put('http://localhost/api/discussions/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete('http://localhost/api/discussions/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

export default handlers
