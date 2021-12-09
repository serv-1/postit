import { rest } from 'msw'
import { randomBytes } from 'crypto'
import { Session } from 'next-auth'

export const mockSession: Session = {
  user: {
    username: 'jotarokujo',
    id: 1,
    email: 'jotarokujo@speedwagon.com',
  },
  expires: '123213139',
}

export const mockProviders = {
  credentials: {
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    authorize: null,
    credentials: null,
  },
}

export const mockCSRFToken = {
  csrfToken: randomBytes(32).toString('hex'),
}

export const mockCredentialsResponse = {
  ok: true,
  status: 200,
  url: 'http://localhost/auth/login',
}

export const mockSignOutResponse = {
  ok: true,
  status: 200,
  url: 'http://localhost/api/auth/logout',
}

const handlers = [
  rest.get('http://localhost/api/auth/session', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockSession))
  ),
  rest.get('http://localhost/api/auth/providers', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockProviders))
  ),
  rest.get('http://localhost/api/auth/csrf', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockCSRFToken))
  ),
  rest.post('http://localhost/api/auth/signout', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockSignOutResponse))
  ),
  rest.post('http://localhost/api/auth/callback/credentials', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockCredentialsResponse))
  ),
  rest.post('http://localhost/api/auth/_log', (req, res, ctx) =>
    res(ctx.status(200))
  ),
]

export default handlers
