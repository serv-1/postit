import updateUserEmailSchema from '../../schemas/updateUserEmailSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = updateUserEmailSchema.validate({ email: 'a@a.a' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const { error: e } = updateUserEmailSchema.validate({})
  expect(e?.details[0].message).toBe(err.EMAIL_REQUIRED)
})
