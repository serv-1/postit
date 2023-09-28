import updateUserPassword from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = updateUserPassword.validate({ password: 'super password' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the password is undefined', () => {
  const { error } = updateUserPassword.validate({})

  expect(error?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})
