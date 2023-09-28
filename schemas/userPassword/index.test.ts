import userPassword from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = userPassword.validate('super password')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = userPassword.validate('   super password   ')

  expect(result.value).toBe('super password')
})

it('fails if the value is not a string', () => {
  const { error } = userPassword.validate(1)

  expect(error?.details[0].message).toBe(err.PASSWORD_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = userPassword.validate('')

  expect(error?.details[0].message).toBe(err.PASSWORD_REQUIRED)
})

it('fails if the value is too short', () => {
  const { error } = userPassword.validate('pw')

  expect(error?.details[0].message).toBe(err.PASSWORD_MIN)
})

it('fails if the value is too long', () => {
  const { error } = userPassword.validate('super mega ultra password')

  expect(error?.details[0].message).toBe(err.PASSWORD_MAX)
})
