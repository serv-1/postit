import { randomBytes, scryptSync, type BinaryLike } from 'crypto'

export default function hash(
  password: BinaryLike,
  saltSize = 16,
  keySize = 64
) {
  const salt = randomBytes(saltSize).toString('hex')
  const key = scryptSync(password, salt, keySize).toString('hex')

  return salt + ':' + key
}
