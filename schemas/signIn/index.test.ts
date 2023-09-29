import { EMAIL_REQUIRED, PASSWORD_REQUIRED } from 'constants/errors'
import signIn from '.'

it('passes', () => {
  const result = signIn.validate({ email: 'a@a.a', password: 'super password' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const { error } = signIn.validate({ password: 'super password' })

  expect(error?.details[0].message).toBe(EMAIL_REQUIRED)
})

it('fails if the password is undefined', () => {
  const { error } = signIn.validate({ email: 'john@test.com' })

  expect(error?.details[0].message).toBe(PASSWORD_REQUIRED)
})
