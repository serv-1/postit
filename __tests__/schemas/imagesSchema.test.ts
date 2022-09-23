import imagesSchema from '../../schemas/imagesSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = imagesSchema.validate(['keyName'])
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an array', () => {
  const { error: e } = imagesSchema.validate(1)
  expect(e?.details[0].message).toBe(err.IMAGES_INVALID)
})

it('fails if the items are not images', () => {
  const { error: e } = imagesSchema.validate([1])
  expect(e?.details[0].message).toBe(err.IMAGE_INVALID)
})

it('fails if the value has too many items', () => {
  const images = ['key', 'key', 'key', 'key', 'key', 'key']
  const { error: e } = imagesSchema.validate(images)
  expect(e?.details[0].message).toBe(err.IMAGES_MAX)
})
