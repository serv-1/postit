import userEmail from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = userEmail.validate('just@do.it')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = userEmail.validate('   just@do.it   ')

  expect(result.value).toBe('just@do.it')
})

it('fails if the value is not a string', () => {
  const { error } = userEmail.validate(1)

  expect(error?.details[0].message).toBe(err.EMAIL_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = userEmail.validate('')

  expect(error?.details[0].message).toBe(err.EMAIL_REQUIRED)
})

it('fails if the value is not an email', () => {
  const { error } = userEmail.validate('no')

  expect(error?.details[0].message).toBe(err.EMAIL_INVALID)
})
