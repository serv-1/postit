import imagesFileListSchema from '../../schemas/imagesFileListSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = imagesFileListSchema.validate({ 0: '' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an object', () => {
  const { error: e } = imagesFileListSchema.validate(1)
  expect(e?.details[0].message).toBe(err.IMAGES_INVALID)
})

it('fails if the value has too many properties', () => {
  const tooManyProps = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const { error: e } = imagesFileListSchema.validate(tooManyProps)
  expect(e?.details[0].message).toBe(err.IMAGES_MAX)
})
