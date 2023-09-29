import {
  NAME_REQUIRED,
  DESCRIPTION_REQUIRED,
  CATEGORIES_REQUIRED,
  PRICE_REQUIRED,
  ADDRESS_REQUIRED,
  PRICE_INVALID,
} from 'constants/errors'
import createPost from '.'

it('passes', () => {
  const result = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    address: 'Oslo, Norway',
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const { error } = createPost.validate({
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    address: 'Oslo, Norway',
  })

  expect(error?.details[0].message).toBe(NAME_REQUIRED)
})

it('fails if the descrition is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    categories: ['furniture'],
    price: 20,
    address: 'Oslo, Norway',
  })

  expect(error?.details[0].message).toBe(DESCRIPTION_REQUIRED)
})

it('fails if the categories are undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    price: 20,
    address: 'Oslo, Norway',
  })

  expect(error?.details[0].message).toBe(CATEGORIES_REQUIRED)
})

it('fails if the price is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    address: 'Oslo, Norway',
  })

  expect(error?.details[0].message).toBe(PRICE_REQUIRED)
})

it('fails if the address is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
  })

  expect(error?.details[0].message).toBe(ADDRESS_REQUIRED)
})

it('fails if there are no categories', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: [],
    price: 20,
    address: 'Oslo, Norway',
  })

  expect(error?.details[0].message).toBe(CATEGORIES_REQUIRED)
})

it('fails if the price is less than 1', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 0,
    address: 'Oslo, Norway',
  })

  expect(error?.details[0].message).toBe(PRICE_INVALID)
})
