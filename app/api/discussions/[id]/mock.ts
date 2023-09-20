import { rest } from 'msw'

const handlers = [
  rest.get('http://localhost/api/discussions/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '0',
        postId: '0',
        postName: 'table',
        channelName: 'channel name',
        messages: [
          {
            message: 'yo',
            createdAt: new Date(),
            userId: '0',
            seen: false,
          },
        ],
        buyer: {
          id: '0',
          name: 'john',
          image: 'john.jpeg',
        },
        seller: {
          id: '1',
          name: 'bob',
          image: 'bob.jpeg',
        },
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
