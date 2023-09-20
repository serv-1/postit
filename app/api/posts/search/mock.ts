import { rest } from 'msw'

const handlers = [
  rest.get('http://localhost/api/posts/search', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        posts: [
          {
            id: '0',
            name: 'Blue cat',
            price: 50,
            image: 'blue-cat.jpeg',
            address: 'Paris, France',
          },
          {
            id: '1',
            name: 'Red cat',
            price: 100,
            image: 'red-cat.jpeg',
            address: 'Oslo, Norway',
          },
        ],
        totalPosts: 2,
        totalPages: 1,
      })
    )
  }),
]

export default handlers
