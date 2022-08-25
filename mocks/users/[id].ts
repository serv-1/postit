import { rest } from 'msw'
import { mockSession } from '../nextAuth'

const handlers = [
  rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: mockSession.id,
        name: 'John Doe',
        email: 'johndoe@test.com',
        image: 'data:image/jpeg;base64,E4d54=',
        discussionsIds: [],
        posts: [],
        favPosts: [],
        hasUnseenMessages: false,
        channelName: 'test',
      })
    )
  }),
]

export default handlers
