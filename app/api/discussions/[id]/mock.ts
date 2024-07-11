import { rest } from 'msw'
import type { Discussion } from 'types'

const handlers = [
  rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<Discussion>({
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
      })
    )
  }),
  rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
  rest.delete('http://localhost/api/discussions/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  }),
]

export default handlers
