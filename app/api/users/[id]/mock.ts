import { rest } from 'msw'

const handlers = [
  rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'john.jpeg',
        postIds: [],
        favPostIds: [],
        discussions: [],
        channelName: 'channel name',
      })
    )
  }),
]

export default handlers
