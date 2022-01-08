import msw, { rest } from 'msw'
import server from '../mocks/server'

export const mockResponse = (
  method: string,
  path: string,
  code: number,
  json?: {}
) => {
  let handler: msw.RestHandler
  const url = 'http://localhost:3000' + path
  const resolver: msw.ResponseResolver<msw.RestRequest, msw.RestContext> = (
    req,
    res,
    ctx
  ) => {
    return res(ctx.status(code), ctx.json(json))
  }

  switch (method) {
    case 'get':
      handler = rest.get(url, resolver)
      break
    case 'put':
      handler = rest.put(url, resolver)
      break
    case 'head':
      handler = rest.head(url, resolver)
      break
    case 'post':
      handler = rest.post(url, resolver)
      break
    case 'delete':
      handler = rest.delete(url, resolver)
      break
    case 'patch':
      handler = rest.patch(url, resolver)
      break
    case 'options':
      handler = rest.options(url, resolver)
      break
    default:
      throw new Error('The given method is invalid. (use lowercase)')
  }

  server.use(handler)
}
