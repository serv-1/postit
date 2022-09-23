import { rest } from 'msw'

const handlers = [
  rest.put('http://localhost/api/s3', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ url: 'https://aws-s3-presigned-url.com', key: 'keyName' })
    )
  }),
]

export default handlers
