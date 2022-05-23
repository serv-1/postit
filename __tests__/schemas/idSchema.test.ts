import idSchema from '../../schemas/idSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = idSchema.validate('f0f0f0f0f0f0f0f0f0f0f0f0')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error: e } = idSchema.validate(1)
  expect(e?.details[0].message).toBe(err.ID_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error: e } = idSchema.validate('')
  expect(e?.details[0].message).toBe(err.ID_INVALID)
})

it('fails if the value too long', () => {
  const { error: e } = idSchema.validate(new Uint8Array(25).toString())
  expect(e?.details[0].message).toBe(err.ID_INVALID)
})

it('fails if the value too short', () => {
  const { error: e } = idSchema.validate('f0')
  expect(e?.details[0].message).toBe(err.ID_INVALID)
})

it('fails if the value is not an hexadecimal string', () => {
  const { error: e } = idSchema.validate('no')
  expect(e?.details[0].message).toBe(err.ID_INVALID)
})
