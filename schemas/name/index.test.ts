import { NAME_REQUIRED, NAME_INVALID, NAME_MAX } from 'constants/errors'
import name from '.'

it('passes', () => {
  const result = name.validate('John Doe')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = name.validate('   John Doe   ')

  expect(result.value).toBe('John Doe')
})

it('fails if the value is an empty string', () => {
  const { error } = name.validate('')

  expect(error?.details[0].message).toBe(NAME_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error } = name.validate(1)

  expect(error?.details[0].message).toBe(NAME_INVALID)
})

it('fails if the value contain an emoji', () => {
  const { error } = name.validate('John Cool 😎')

  expect(error?.details[0].message).toBe(NAME_INVALID)
})

it('fails if the value is too long', () => {
  const { error } = name.validate(new Uint8Array(91).toString())

  expect(error?.details[0].message).toBe(NAME_MAX)
})
