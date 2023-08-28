/**
 * @jest-environment node
 */

import verifyCsrfTokens from '.'
import { createHash } from 'crypto'
import env from 'utils/constants/env'
import { NextRequest } from 'next/server'

describe('verifyCsrfTokens()', () => {
  it('returns false if there is no csrf cookie', () => {
    const request = new NextRequest('http://-', {
      headers: { 'x-csrf-token': 'token' },
    })

    expect(verifyCsrfTokens(request)).toBe(false)
  })

  it('returns false if there is no csrf header', () => {
    const request = new NextRequest('http://-')

    request.cookies.set(env.CSRF_COOKIE_NAME, 'token')

    expect(verifyCsrfTokens(request)).toBe(false)
  })

  it('returns false if they are not the same', () => {
    const request = new NextRequest('http://-', {
      headers: { 'x-csrf-token': 'different token' },
    })

    const csrfTokenHash = createHash('sha256')
      .update('token' + env.SECRET)
      .digest('hex')

    request.cookies.set(env.CSRF_COOKIE_NAME, csrfTokenHash)

    expect(verifyCsrfTokens(request)).toBe(false)
  })

  it('returns true if they are the same', () => {
    const request = new NextRequest('http://-', {
      headers: { 'x-csrf-token': 'token' },
    })

    const csrfTokenHash = createHash('sha256')
      .update('token' + env.SECRET)
      .digest('hex')

    request.cookies.set(env.CSRF_COOKIE_NAME, '|' + csrfTokenHash)

    expect(verifyCsrfTokens(request)).toBe(true)
  })
})
