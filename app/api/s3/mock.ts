import { http, HttpResponse } from 'msw'

const presignedUrl = 'https://aws-presigned-url'
const handlers = [
  http.get('http://localhost/api/s3', () => {
    return HttpResponse.json(
      {
        url: presignedUrl,
        fields: { a: 'a', b: 'b', c: 'c' },
        key: 'key',
      },
      { status: 200 }
    )
  }),
  http.post(presignedUrl, () => {
    return new HttpResponse(null, { status: 201 })
  }),
]

export default handlers
