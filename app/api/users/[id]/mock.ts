import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('api/users/:id', () => {
    return HttpResponse.json(
      {
        _id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'john.jpeg',
        postIds: [],
        favPostIds: [],
        discussions: [],
      },
      { status: 200 },
    )
  }),
]

export default handlers
