import keySchema from '../../schemas/keySchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = keySchema.validate('keyName')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if it is not a string', () => {
  const { error: e } = keySchema.validate(0)
  expect(e?.details[0].message).toBe(err.KEY_INVALID)
})

it('fails if it is an empty string', () => {
  const { error: e } = keySchema.validate('')
  expect(e?.details[0].message).toBe(err.KEY_INVALID)
})

it('fails if it is too long', () => {
  const { error: e } = keySchema.validate(new Uint8Array(1025).toString())
  expect(e?.details[0].message).toBe(err.KEY_INVALID)
})
