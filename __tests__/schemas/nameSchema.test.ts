import nameSchema from '../../schemas/nameSchema'
import err from '../../utils/constants/errors'

it('passes and trim the result', () => {
  const result = nameSchema.validate(' John Doe ')
  expect(result.value).toBe('John Doe')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is an empty string', () => {
  const { error: e } = nameSchema.validate('')
  expect(e?.details[0].message).toBe(err.NAME_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error: e } = nameSchema.validate(1)
  expect(e?.details[0].message).toBe(err.NAME_INVALID)
})

it('fails if the value contain emojis', () => {
  const { error: e } = nameSchema.validate('John Cool 😎')
  expect(e?.details[0].message).toBe(err.NAME_INVALID)
})

it('fails if the value is too long', () => {
  const { error: e } = nameSchema.validate(new Uint8Array(91).toString())
  expect(e?.details[0].message).toBe(err.NAME_MAX)
})
