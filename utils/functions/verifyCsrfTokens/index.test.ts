import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import verifyCsrfTokens from '.'
import { createHash } from 'crypto'
import env from 'utils/constants/env'

describe('verifyCsrfTokens()', () => {
  it('returns false if there is no csrf cookie', () => {
    const cookies = new RequestCookies(new Headers())
    const result = verifyCsrfTokens(cookies, '')

    expect(result).toBe(false)
  })

  it('returns false if they are not the same', () => {
    const cookies = new RequestCookies(new Headers())
    const csrfTokenHash = createHash('sha256')
      .update('token' + env.SECRET)
      .digest('hex')

    cookies.set(env.CSRF_COOKIE_NAME, csrfTokenHash)

    const result = verifyCsrfTokens(cookies, 'different token')

    expect(result).toBe(false)
  })

  it('returns true if they are the same', () => {
    const cookies = new RequestCookies(new Headers())
    const csrfTokenHash = createHash('sha256')
      .update('token' + env.SECRET)
      .digest('hex')

    cookies.set(env.CSRF_COOKIE_NAME, csrfTokenHash)

    const result = verifyCsrfTokens(cookies, 'token')

    expect(result).toBe(false)
  })
})
