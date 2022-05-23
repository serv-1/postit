import updateUserEmailSchema from '../../schemas/updateUserEmailSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { csrfToken: 'csrfToken', email: 'a@a.a' }
  const result = updateUserEmailSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const value = { csrfToken: 'csrfToken' }
  const { error: e } = updateUserEmailSchema.validate(value)
  expect(e?.details[0].message).toBe(err.EMAIL_REQUIRED)
})
