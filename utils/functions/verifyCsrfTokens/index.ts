import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import env from 'utils/constants/env'

export default function verifyCsrfTokens(request: NextRequest) {
  const csrfCookie = request.cookies.get(env.CSRF_COOKIE_NAME)
  const headerCsrfToken = request.headers.get('x-csrf-token')

  if (!csrfCookie || !headerCsrfToken) return false

  const hash = csrfCookie.value.split('|')[1]
  const expectedHash = createHash('sha256')
    .update(headerCsrfToken + env.SECRET)
    .digest('hex')

  return expectedHash === hash
}
