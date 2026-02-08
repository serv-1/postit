import { EMAIL_REQUIRED } from 'constants/errors'
import forgotPassword from '.'

it('passes', () => {
  const result = forgotPassword.validate({ email: 'bob@bob.bob' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const { error } = forgotPassword.validate({})

  expect(error?.details[0].message).toBe(EMAIL_REQUIRED)
})
