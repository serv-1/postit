import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('http://localhost/api/users/:id', () => {
    return HttpResponse.json(
      {
        _id: '0',
        name: 'john',
        email: 'john@test.com',
        image: 'john.jpeg',
        postIds: [],
        favPostIds: [],
        discussions: [],
        channelName: 'channel name',
      },
      { status: 200 }
    )
  }),
]

export default handlers
