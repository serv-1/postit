import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('http://localhost/api/posts/search', () => {
    return HttpResponse.json(
      {
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
      },
      { status: 200 }
    )
  }),
]

export default handlers
