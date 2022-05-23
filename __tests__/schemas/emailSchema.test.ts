import emailSchema from '../../schemas/emailSchema'
import err from '../../utils/constants/errors'

it('passes and trims the result', () => {
  const result = emailSchema.validate(' just@do.it ')
  expect(result.value).toBe('just@do.it')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error: e } = emailSchema.validate(1)
  expect(e?.details[0].message).toBe(err.EMAIL_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error: e } = emailSchema.validate('')
  expect(e?.details[0].message).toBe(err.EMAIL_REQUIRED)
})

it('fails if the value is not an email', () => {
  const { error: e } = emailSchema.validate('no')
  expect(e?.details[0].message).toBe(err.EMAIL_INVALID)
})
