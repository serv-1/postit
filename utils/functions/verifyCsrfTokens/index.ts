import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { CSRF_COOKIE_NAME, SECRET } from 'env'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'

export default function verifyCsrfTokens(request: NextRequest) {
  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)
  const headerCsrfToken = request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)

  if (!csrfCookie || !headerCsrfToken) return false

  const hash = csrfCookie.value.split('|')[1]
  const expectedHash = createHash('sha256')
    .update(headerCsrfToken + SECRET)
    .digest('hex')

  return expectedHash === hash
}
