import passwordSchema from '../../schemas/passwordSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = passwordSchema.validate('super password')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error: e } = passwordSchema.validate(1)
  expect(e?.details[0].message).toBe(err.PASSWORD_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error: e } = passwordSchema.validate('')
  expect(e?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})

it('fails if the value is too short', () => {
  const { error: e } = passwordSchema.validate('pw')
  expect(e?.details[0].message).toBe(err.PASSWORD_MIN)
})

it('fails if the value is too long', () => {
  const { error: e } = passwordSchema.validate('super mega ultra password')
  expect(e?.details[0].message).toBe(err.PASSWORD_MAX)
})
