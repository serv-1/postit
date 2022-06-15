import { rest } from 'msw'

const handlers = [
  rest.get('https://api.locationiq.com/v1/search.php', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ lat: '59', lon: '10' }]))
  }),
]

export default handlers
