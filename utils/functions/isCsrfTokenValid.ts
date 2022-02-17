import { createHash } from 'crypto'
import env from '../constants/env'

/**
 * Tell if the given CSRF token match the one stored in the encrypted cookie.
 *
 * @param cookie encrypted cookie which store the CSRF token
 * @param csrfToken CSRF token to verify
 * @returns true if the CSRF tokens match else false
 */
const isCsrfTokenValid = (cookie: string, csrfToken: string) => {
  const hash = cookie.split('|')[1]
  const expectedHash = createHash('sha256')
    .update(csrfToken + env.SECRET)
    .digest('hex')

  return expectedHash === hash
}

export default isCsrfTokenValid
