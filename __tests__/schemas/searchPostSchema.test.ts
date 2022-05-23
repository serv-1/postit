import searchPostSchema from '../../schemas/searchPostSchema'
import err from '../../utils/constants/errors'

const VALUE = {
  query: 'table',
  page: 1,
  minPrice: 10,
  maxPrice: 20,
  categories: ['furniture'],
}

it('passes', () => {
  const result = searchPostSchema.validate(VALUE)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows minPrice and maxPrice to be an empty string', () => {
  let result = searchPostSchema.validate({ ...VALUE, minPrice: '' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = searchPostSchema.validate({ ...VALUE, maxPrice: '' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  const value = { ...VALUE, minPrice: '', maxPrice: '' }
  result = searchPostSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if maxPrice is smaller than minPrice', () => {
  const value = { ...VALUE, minPrice: 20, maxPrice: 10 }
  const { error: e } = searchPostSchema.validate(value)
  expect(e?.details[0].message).toBe(err.MAX_PRICE_MIN)
})
