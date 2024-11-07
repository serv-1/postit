import type { BinaryLike } from 'crypto'

export default function hash(password: BinaryLike) {
  return 'salt' + ':' + password
}
