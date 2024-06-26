import { randomBytes, scryptSync } from 'crypto'

export default function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password, salt, 64).toString('hex')

  return salt + ':' + key
}
