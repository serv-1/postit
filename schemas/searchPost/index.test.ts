import searchPost from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = searchPost.validate({
    query: 'table',
    page: 1,
    minPrice: 10,
    maxPrice: 20,
    categories: ['furniture'],
    address: 'Oslo, Norway',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the query is undefined', () => {
  const { error } = searchPost.validate({ categories: ['furniture'] })

  expect(error?.details[0].message).toBe(err.QUERY_REQUIRED)
})

it('fails if the categories are undefined', () => {
  const { error } = searchPost.validate({ query: 'table' })

  expect(error?.details[0].message).toBe(err.CATEGORIES_REQUIRED)
})

it('allows the page number to be null', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    page: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the minimum price to be null', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the maximum price to be null', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    maxPrice: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the address to be null', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    address: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the maximum price is less than the minimum price', () => {
  const { error } = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: 20,
    maxPrice: 10,
  })

  expect(error?.details[0].message).toBe(err.MAX_PRICE_MIN)
})
