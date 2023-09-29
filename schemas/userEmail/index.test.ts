import { EMAIL_INVALID, EMAIL_REQUIRED } from 'constants/errors'
import userEmail from '.'

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

  expect(error?.details[0].message).toBe(EMAIL_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = userEmail.validate('')

  expect(error?.details[0].message).toBe(EMAIL_REQUIRED)
})

it('fails if the value is not an email', () => {
  const { error } = userEmail.validate('no')

  expect(error?.details[0].message).toBe(EMAIL_INVALID)
})
