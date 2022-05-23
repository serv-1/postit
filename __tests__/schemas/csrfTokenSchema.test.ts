import csrfTokenSchema from '../../schemas/csrfTokenSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = csrfTokenSchema.validate('test')
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is an empty string', () => {
  const { error: e } = csrfTokenSchema.validate('')
  expect(e?.details[0].message).toBe(err.CSRF_TOKEN_INVALID)
})

it('fails if the value is not a string', () => {
  const { error: e } = csrfTokenSchema.validate(1)
  expect(e?.details[0].message).toBe(err.CSRF_TOKEN_INVALID)
})

it('fails if the value is undefined', () => {
  const { error: e } = csrfTokenSchema.validate(undefined)
  expect(e?.details[0].message).toBe(err.CSRF_TOKEN_INVALID)
})
