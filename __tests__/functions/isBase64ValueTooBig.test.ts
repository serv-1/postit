import isBase64ValueTooBig from '../../utils/functions/isBase64ValueTooBig'
import { Buffer } from 'buffer'

it('return true if the value is greater than the size limit', () => {
  const value = Buffer.from(new Uint8Array(10)).toString('base64')

  const result = isBase64ValueTooBig(value, 9)

  expect(result).toBe(true)
})

it('return false if the value is lesser than or equal to the size limit', () => {
  const value = Buffer.from(new Uint8Array(9)).toString('base64')

  const result = isBase64ValueTooBig(value, 10)

  expect(result).toBe(false)
})
