import {
  CATEGORIES_REQUIRED,
  MAX_PRICE_MIN,
  QUERY_REQUIRED,
} from 'constants/errors'
import serverPost from '.'

it('passes', () => {
  const result = serverPost.validate({
    query: 'table',
    page: 2,
    minPrice: 10,
    maxPrice: 30,
    categories: ['furniture'],
    address: 'Oslo, Norway',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the query is undefined', () => {
  const { error } = serverPost.validate({
    categories: ['furniture'],
  })

  expect(error?.details[0].message).toBe(QUERY_REQUIRED)
})

it('allows the page to be null', () => {
  const result = serverPost.validate({
    query: 'table',
    categories: ['furniture'],
    page: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the min price to be null', () => {
  const result = serverPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows the max price to be null', () => {
  const result = serverPost.validate({
    query: 'table',
    categories: ['furniture'],
    maxPrice: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it("adjusts the min price to 0 if it's null when the max price is defined", () => {
  const result = serverPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: null,
    maxPrice: 30,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the min price is greater than the max price', () => {
  const { error } = serverPost.validate({
    query: 'table',
    categories: ['furniture'],
    minPrice: 30,
    maxPrice: 10,
  })

  expect(error?.details[0].message).toBe(MAX_PRICE_MIN)
})

it('fails if the categories are undefined', () => {
  const { error } = serverPost.validate({
    query: 'table',
  })

  expect(error?.details[0].message).toBe(CATEGORIES_REQUIRED)
})

it('allows the address to be null', () => {
  const result = serverPost.validate({
    query: 'table',
    categories: ['furniture'],
    address: null,
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})
