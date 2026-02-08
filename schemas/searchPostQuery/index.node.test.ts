import { QUERY_REQUIRED, QUERY_INVALID, QUERY_MAX } from 'constants/errors'
import searchPostQuery from '.'

it('passes', () => {
  const result = searchPostQuery.validate('table')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = searchPostQuery.validate('   table   ')

  expect(result.value).toBe('table')
})

it('fails if the value is an empty string', () => {
  const { error } = searchPostQuery.validate('')

  expect(error?.details[0].message).toBe(QUERY_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error } = searchPostQuery.validate(1)

  expect(error?.details[0].message).toBe(QUERY_INVALID)
})

it('fails if the value contain an emoji', () => {
  const { error } = searchPostQuery.validate('dog 🐶')

  expect(error?.details[0].message).toBe(QUERY_INVALID)
})

it('fails if the value is too long', () => {
  const { error } = searchPostQuery.validate(new Uint8Array(91).toString())

  expect(error?.details[0].message).toBe(QUERY_MAX)
})
