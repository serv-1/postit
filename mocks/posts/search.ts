import { rest } from 'msw'

export const data = {
  posts: [
    {
      id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
      name: 'Blue cat',
      description: 'Magnificent blue cat',
      categories: ['cat'],
      price: 50,
      images: ['LKDFlkjdlskjLJFsjLK.jpeg'],
      userId: 'f1f1f1f1f1f1f1f1f1f1f1f1',
    },
    {
      id: 'f2f2f2f2f2f2f2f2f2f2f2f2',
      name: 'Red cat',
      description: 'Breathtaking red cat',
      categories: ['cat'],
      price: 100,
      images: ['LJFSLdlkoijsd.jpeg'],
      userId: 'f3f3f3f3f3f3f3f3f3f3f3f3',
    },
  ],
  totalPages: 1,
  totalPosts: 2,
}

const handlers = [
  rest.get('http://localhost:3000/api/posts/search', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(data))
  }),
]

export default handlers
