import { rest } from 'msw'

export const data = {
  posts: [
    {
      id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
      name: 'Aston Martin',
      description: 'Aston Martin',
      categories: ['car'],
      price: 50,
      images: ['data:image/jpeg;base64,KLsldJLSSK='],
      userId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
    },
  ],
  totalPages: 1,
  totalPosts: 1,
}

const handlers = [
  rest.get('http://localhost:3000/api/posts/search', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(data))
  }),
]

export default handlers
