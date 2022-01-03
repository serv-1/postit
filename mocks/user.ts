import { rest } from 'msw'
import { EMAIL_USED } from '../utils/errors'

const handlers = [
  rest.post('http://localhost:3000/api/user', (req, res, ctx) => {
    return res(
      ctx.status(422),
      ctx.json({
        name: 'email',
        message: EMAIL_USED,
      })
    )
  }),
]

export default handlers
