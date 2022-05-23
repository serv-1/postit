import forgotPwSchema from '../../schemas/forgotPwSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = forgotPwSchema.validate({ email: 'bob@bob.bob' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if email is undefined', () => {
  const { error: e } = forgotPwSchema.validate({})
  expect(e?.details[0].message).toBe(err.EMAIL_REQUIRED)
})
