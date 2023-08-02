import { createHash } from 'crypto'
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import env from 'utils/constants/env'

export default function verifyCsrfTokens(
  cookies: RequestCookies,
  csrfToken: string
) {
  const csrfCookieValue = cookies.get(env.CSRF_COOKIE_NAME)?.value

  if (!csrfCookieValue) return false

  const hash = csrfCookieValue.split('|')[1]
  const expectedHash = createHash('sha256')
    .update(csrfToken + env.SECRET)
    .digest('hex')

  return expectedHash === hash
}
