import { IMAGES_INVALID, IMAGE_INVALID, IMAGES_MAX } from 'constants/errors'
import postImages from '.'

it('passes', () => {
  const result = postImages.validate(['key'])

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an array', () => {
  const { error } = postImages.validate(1)

  expect(error?.details[0].message).toBe(IMAGES_INVALID)
})

it('fails if the items are not image keys', () => {
  const { error } = postImages.validate([1])

  expect(error?.details[0].message).toBe(IMAGE_INVALID)
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

  expect(error?.details[0].message).toBe(IMAGES_MAX)
})
