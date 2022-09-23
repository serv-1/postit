import { rest } from 'msw'

const handlers = [
  rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'keyName',
        postsIds: [],
        favPostsIds: [],
        discussionsIds: [],
        hasUnseenMessages: false,
        channelName: 'test',
      })
    )
  }),
]

export default handlers
