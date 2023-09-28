import postImages from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = postImages.validate(['key'])

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an array', () => {
  const { error } = postImages.validate(1)

  expect(error?.details[0].message).toBe(err.IMAGES_INVALID)
})

it('fails if the items are not image keys', () => {
  const { error } = postImages.validate([1])

  expect(error?.details[0].message).toBe(err.IMAGE_INVALID)
})

it('fails if there are more than 5 image keys', () => {
  const { error } = postImages.validate([
    'key',
    'key',
    'key',
    'key',
    'key',
    'key',
  ])

  expect(error?.details[0].message).toBe(err.IMAGES_MAX)
})
