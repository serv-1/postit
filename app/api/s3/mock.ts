import { rest } from 'msw'

const presignedUrl = 'https://aws-presigned-url'
const handlers = [
  rest.get('http://localhost/api/s3', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        url: presignedUrl,
        fields: { a: 'a', b: 'b', c: 'c' },
        key: 'key',
      })
    )
  }),
  rest.post(presignedUrl, (req, res, ctx) => {
    return res(ctx.status(201))
  }),
]

export default handlers
