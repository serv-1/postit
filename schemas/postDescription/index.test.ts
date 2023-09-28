import postDescription from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = postDescription.validate('My description.')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('trims the value', () => {
  const result = postDescription.validate('   My description.   ')

  expect(result.value).toBe('My description.')
})

it('fails if the value is an empty string', () => {
  const { error } = postDescription.validate('')

  expect(error?.details[0].message).toBe(err.DESCRIPTION_REQUIRED)
})

it('fails if the value is not a string', () => {
  const { error } = postDescription.validate(1)

  expect(error?.details[0].message).toBe(err.DESCRIPTION_INVALID)
})

it('fails if the value is too short', () => {
  const { error } = postDescription.validate('no')

  expect(error?.details[0].message).toBe(err.DESCRIPTION_MIN)
})

it('fails if the value is too long', () => {
  const { error } = postDescription.validate(new Uint8Array(301).toString())

  expect(error?.details[0].message).toBe(err.DESCRIPTION_MAX)
})
