import updateUserPwSchema from '../../schemas/updateUserPwSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = updateUserPwSchema.validate({ password: 'super password' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the password is undefined', () => {
  const { error: e } = updateUserPwSchema.validate({})
  expect(e?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})
