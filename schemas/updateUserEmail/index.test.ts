import updateUserEmail from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = updateUserEmail.validate({ email: 'a@a.a' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the email is undefined', () => {
  const { error } = updateUserEmail.validate({})

  expect(error?.details[0].message).toBe(err.EMAIL_REQUIRED)
})
