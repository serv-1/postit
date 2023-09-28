import imageKey from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = imageKey.validate('key')

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a string', () => {
  const { error } = imageKey.validate(0)

  expect(error?.details[0].message).toBe(err.IMAGE_INVALID)
})

it('fails if the value is an empty string', () => {
  const { error } = imageKey.validate('')

  expect(error?.details[0].message).toBe(err.IMAGE_REQUIRED)
})

it('fails if the value is too long', () => {
  const { error } = imageKey.validate(new Uint8Array(1025).toString())

  expect(error?.details[0].message).toBe(err.IMAGE_INVALID)
})
