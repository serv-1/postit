import { ADDRESS_REQUIRED, ADDRESS_INVALID } from 'constants/errors'
import postAddress from '.'

it('passes', () => {
  const result = postAddress.validate('Oslo, Norway')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = postAddress.validate('   Oslo, Norway   ')

  expect(result.value).toBe('Oslo, Norway')
})

it('fails if the value is an empty string', () => {
  const { error } = postAddress.validate('')

  expect(error?.details[0].message).toBe(ADDRESS_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error } = postAddress.validate(1)

  expect(error?.details[0].message).toBe(ADDRESS_INVALID)
})
