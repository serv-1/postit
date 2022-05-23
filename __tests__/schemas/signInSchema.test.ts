import signInSchema from '../../schemas/signInSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { email: 'a@a.a', password: 'a super pw' }
  const result = signInSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails when any property is undefined', () => {
  const { error: e } = signInSchema.validate({ password: 'a super pw' })
  expect(e?.details[0].message).toBe(err.EMAIL_REQUIRED)

  const { error: _e } = signInSchema.validate({ email: 'a@a.a' })
  expect(_e?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})
