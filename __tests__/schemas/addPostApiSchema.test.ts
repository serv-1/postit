import addPostApiSchema from '../../schemas/addPostApiSchema'
import err from '../../utils/constants/errors'

const VALUE = {
  csrfToken: 'csrfToken',
  name: 'table',
  description: 'magnificent table',
  categories: ['furniture'],
  price: 20,
}

it('passes', () => {
  const v = { ...VALUE, images: [{ base64: 'af0=', ext: 'jpg' }] }
  const result = addPostApiSchema.validate(v)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if images is undefined', () => {
  const { error: e } = addPostApiSchema.validate(VALUE)
  expect(e?.details[0].message).toBe(err.IMAGES_REQUIRED)
})

it('fails if there is no images', () => {
  const { error: e } = addPostApiSchema.validate({ ...VALUE, images: [] })
  expect(e?.details[0].message).toBe(err.IMAGES_REQUIRED)
})
