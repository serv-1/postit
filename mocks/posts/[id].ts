import { rest } from 'msw'

const handlers = [
  rest.get('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '0',
        name: 'Table',
        description: 'Magnificent table',
        price: 50,
        categories: ['furniture'],
        images: ['table.jpeg'],
        address: 'Oslo, Norway',
        latLon: [42, 58],
        discussionsIds: [],
        user: {
          id: '0',
          name: 'bob',
          email: 'bob@bob.bob',
          image: 'bob.jpeg',
          posts: [],
        },
      })
    )
  }),
  rest.put('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
  rest.delete('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]

export default handlers
