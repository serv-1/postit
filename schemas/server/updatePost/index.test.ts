/**
 * @jest-environment node
 */

import updatePost from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = updatePost.validate({ address: 'Paris', latLon: [17, 58] })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the price is less than 1', () => {
  const { error } = updatePost.validate({ price: 0 })

  expect(error?.details[0].message).toBe(err.PRICE_INVALID)
})

it('fails if the latitude & longitude are undefined when address is defined', () => {
  const { error } = updatePost.validate({ address: 'Paris' })

  expect(error?.details[0].message).toBe(err.ADDRESS_INVALID)
})

it('fails if a property is missing', () => {
  const { error } = updatePost.validate({})

  expect(error?.details[0].message).toBe(err.DATA_INVALID)
})
