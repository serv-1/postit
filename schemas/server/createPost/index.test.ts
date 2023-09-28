/**
 * @jest-environment node
 */

import createPost from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the name is undefined', () => {
  const { error } = createPost.validate({
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.NAME_REQUIRED)
})

it('fails if the description is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    categories: ['furniture'],
    price: 20,
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.DESCRIPTION_REQUIRED)
})

it('fails if the categories is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    price: 20,
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.CATEGORIES_REQUIRED)
})

it('fails if the price is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.PRICE_REQUIRED)
})

it('fails if the address is undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    images: ['key'],
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.ADDRESS_REQUIRED)
})

it('fails if the images are undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.IMAGES_REQUIRED)
})

it('fails if the latitude & longitude are undefined', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    address: 'Oslo, Norway',
    images: ['key'],
  })

  expect(error?.details[0].message).toBe(err.LATLON_REQUIRED)
})

it('fails if there are no categories', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: [],
    price: 20,
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.CATEGORIES_REQUIRED)
})

it('fails if the price is less than 1', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 0,
    images: ['key'],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.PRICE_INVALID)
})

it('fails if there are no images', () => {
  const { error } = createPost.validate({
    name: 'table',
    description: 'magnificent table',
    categories: ['furniture'],
    price: 20,
    images: [],
    address: 'Oslo, Norway',
    latLon: [17, 58],
  })

  expect(error?.details[0].message).toBe(err.IMAGES_REQUIRED)
})
