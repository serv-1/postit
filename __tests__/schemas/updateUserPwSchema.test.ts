import updateUserPwSchema from '../../schemas/updateUserPwSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const value = { csrfToken: 'csrfToken', password: 'super password' }
  const result = updateUserPwSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the password is undefined', () => {
  const value = { csrfToken: 'csrfToken' }
  const { error: e } = updateUserPwSchema.validate(value)
  expect(e?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})
