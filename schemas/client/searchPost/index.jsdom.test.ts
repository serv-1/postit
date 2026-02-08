import {
  CATEGORIES_REQUIRED,
  MAX_PRICE_MIN,
  QUERY_REQUIRED,
} from 'constants/errors'
import searchPost from '.'

it('passes', () => {
  const result = searchPost.validate({
    query: 'table',
    minPrice: 10,
    maxPrice: 30,
    categories: ['furniture'],
    address: 'Oslo, Norway',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the query is undefined', () => {
  const { error } = searchPost.validate({
    categories: ['furniture'],
  })

  expect(error?.details[0].message).toBe(QUERY_REQUIRED)
})

it('allows the min price to be an empty string', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: '',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the max price to be an empty string', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    maxPrice: '',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it("adjusts the min price to 0 if it's an empty string when the max price is defined", () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: '',
    maxPrice: 30,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the min price is greater than the max price', () => {
  const { error } = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: 30,
    maxPrice: 10,
  })

  expect(error?.details[0].message).toBe(MAX_PRICE_MIN)
})

it('fails if the categories are undefined', () => {
  const { error } = searchPost.validate({
    query: 'table',
  })

  expect(error?.details[0].message).toBe(CATEGORIES_REQUIRED)
})

it('allows the address to be an empty string', () => {
  const result = searchPost.validate({
    query: 'table',
    categories: ['furniture'],
    address: '',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})
