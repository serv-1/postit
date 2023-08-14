import searchPostSchema from '../../schemas/searchPostSchema'
import err from '../../utils/constants/errors'

const VALUE = {
  query: 'table',
  page: 1,
  minPrice: 10,
  maxPrice: 20,
  categories: ['furniture'],
  address: 'Oslo, Norway',
}

it('passes', () => {
  const result = searchPostSchema.validate(VALUE)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if one the properties is missing', () => {
  let e = searchPostSchema.validate({
    page: null,
    minPrice: null,
    maxPrice: null,
    categories: [],
    address: null,
  }).error
  expect(e?.details[0].message).toBe(err.QUERY_REQUIRED)

  e = searchPostSchema.validate({
    query: 'cat',
    minPrice: null,
    maxPrice: null,
    categories: [],
    address: null,
  }).error
  expect(e?.details[0].message).toBe(err.PAGE_INVALID)

  e = searchPostSchema.validate({
    query: 'cat',
    page: null,
    maxPrice: null,
    categories: [],
    address: null,
  }).error
  expect(e?.details[0].message).toBe(err.PRICE_REQUIRED)

  e = searchPostSchema.validate({
    query: 'cat',
    page: null,
    minPrice: null,
    categories: [],
    address: null,
  }).error
  expect(e?.details[0].message).toBe(err.PRICE_REQUIRED)

  e = searchPostSchema.validate({
    query: 'cat',
    page: null,
    minPrice: null,
    maxPrice: null,
    address: null,
  }).error
  expect(e?.details[0].message).toBe(err.CATEGORIES_REQUIRED)

  e = searchPostSchema.validate({
    query: 'cat',
    page: null,
    minPrice: null,
    maxPrice: null,
    categories: [],
  }).error
  expect(e?.details[0].message).toBe(err.ADDRESS_REQUIRED)
})

it('allows page, minPrice, maxPrice and address to be null', () => {
  let result = searchPostSchema.validate({ ...VALUE, page: null })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = searchPostSchema.validate({ ...VALUE, minPrice: null })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = searchPostSchema.validate({ ...VALUE, maxPrice: null })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  const value = { ...VALUE, minPrice: null, maxPrice: null }
  result = searchPostSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = searchPostSchema.validate({ ...VALUE, address: null })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows minPrice to be null with a defined maxPrice', () => {
  const value = { ...VALUE, minPrice: null, maxPrice: 20 }
  const result = searchPostSchema.validate(value)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if maxPrice is smaller than minPrice', () => {
  const value = { ...VALUE, minPrice: 20, maxPrice: 10 }
  const { error: e } = searchPostSchema.validate(value)
  expect(e?.details[0].message).toBe(err.MAX_PRICE_MIN)
})
