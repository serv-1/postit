import addPostSchema from '../../schemas/addPostSchema'
import err from '../../utils/constants/errors'

const VALUE = {
  csrfToken: 'csrfToken',
  name: 'table',
  description: 'magnificent table',
  categories: ['furniture'],
  price: 20,
}

it('passes', () => {
  const result = addPostSchema.validate({ ...VALUE, images: { 0: 1 } })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if images is undefined', () => {
  const { error: e } = addPostSchema.validate(VALUE)
  expect(e?.details[0].message).toBe(err.IMAGES_REQUIRED)
})

it('fails if there is no images', () => {
  const { error: e } = addPostSchema.validate({ ...VALUE, images: {} })
  expect(e?.details[0].message).toBe(err.IMAGES_REQUIRED)
})
