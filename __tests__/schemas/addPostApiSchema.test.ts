import addPostApiSchema from '../../schemas/addPostApiSchema'
import err from '../../utils/constants/errors'

const VALUE = {
  csrfToken: 'csrfToken',
  name: 'table',
  description: 'magnificent table',
  categories: ['furniture'],
  price: 20,
  images: [{ base64: 'af0=', ext: 'jpg' }],
  address: 'Oslo, Norway',
  latLon: [17, 58],
}

it('passes', () => {
  const result = addPostApiSchema.validate(VALUE)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if images is undefined', () => {
  const value = { ...VALUE, images: undefined }
  const { error: e } = addPostApiSchema.validate(value)
  expect(e?.details[0].message).toBe(err.IMAGES_REQUIRED)
})

it('fails if there is no images', () => {
  const { error: e } = addPostApiSchema.validate({ ...VALUE, images: [] })
  expect(e?.details[0].message).toBe(err.IMAGES_REQUIRED)
})

it('fails if latLon is undefined', () => {
  const value = { ...VALUE, latLon: undefined }
  const { error: e } = addPostApiSchema.validate(value)
  expect(e?.details[0].message).toBe(err.LATLON_REQUIRED)
})
