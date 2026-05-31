/**
 * @jest-environment node
 */

import { PRICE_INVALID, ADDRESS_INVALID, DATA_INVALID } from 'constants/errors'
import updatePost from '.'

it('passes', () => {
  const result = updatePost.validate({ name: 'Blue Book' })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the price is less than 1', () => {
  const { error } = updatePost.validate({ price: 0 })

  expect(error?.details[0].message).toBe(PRICE_INVALID)
})

it('fails if a property is missing', () => {
  const { error } = updatePost.validate({})

  expect(error?.details[0].message).toBe(DATA_INVALID)
})

describe('location', () => {
  it('fails if the address is undefined', () => {
    const { error } = updatePost.validate({ location: {} })

    expect(error?.details[0].message).toBe(ADDRESS_INVALID)
  })

  it('fails if the latitude & longitude are undefined', () => {
    const { error } = updatePost.validate({ location: { address: 'Paris' } })

    expect(error?.details[0].message).toBe(ADDRESS_INVALID)
  })

  it('fails if there is an unknown key', () => {
    const { error } = updatePost.validate({
      location: { address: 'Paris', latLon: [1, 2], unknownKey: 'boo!' },
    })

    expect(error?.details[0].message).toBe(ADDRESS_INVALID)
  })
})
