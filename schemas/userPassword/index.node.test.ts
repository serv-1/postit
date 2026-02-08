import {
  PASSWORD_INVALID,
  PASSWORD_REQUIRED,
  PASSWORD_MIN,
  PASSWORD_MAX,
} from 'constants/errors'
import userPassword from '.'

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

  expect(error?.details[0].message).toBe(PASSWORD_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = userPassword.validate('')

  expect(error?.details[0].message).toBe(PASSWORD_REQUIRED)
})

it('fails if the value is too short', () => {
  const { error } = userPassword.validate('pw')

  expect(error?.details[0].message).toBe(PASSWORD_MIN)
})

it('fails if the value is too long', () => {
  const { error } = userPassword.validate('super mega ultra password')

  expect(error?.details[0].message).toBe(PASSWORD_MAX)
})
