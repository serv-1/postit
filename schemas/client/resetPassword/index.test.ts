import { PASSWORD_REQUIRED } from 'constants/errors'
import resetPassword from '.'

it('passes', () => {
  const result = resetPassword.validate({
    password: '0123456789',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the password is undefined', () => {
  const { error } = resetPassword.validate({})

  expect(error?.details[0].message).toBe(PASSWORD_REQUIRED)
})
