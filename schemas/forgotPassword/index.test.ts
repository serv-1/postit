import forgotPassword from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = forgotPassword.validate({ email: 'bob@bob.bob' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const { error } = forgotPassword.validate({})

  expect(error?.details[0].message).toBe(err.EMAIL_REQUIRED)
})
