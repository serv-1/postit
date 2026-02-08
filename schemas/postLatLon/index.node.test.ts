import { LATLON_INVALID } from 'constants/errors'
import postLatLon from '.'

it('passes', () => {
  const result = postLatLon.validate([15, 28])

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an array', () => {
  const { error } = postLatLon.validate('')

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})

it("fails if the value isn't [latitude, longitude]", () => {
  const { error } = postLatLon.validate([1])

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})

it('fails if the latitude is not a number', () => {
  const { error } = postLatLon.validate(['a', 2])

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})

it('fails if the latitude is infinity', () => {
  const { error } = postLatLon.validate([Infinity, 2])

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})

it('fails if the longitude is not a number', () => {
  const { error } = postLatLon.validate([1, 'a'])

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})

it('fails if the longitude is infinity', () => {
  const { error } = postLatLon.validate([1, Infinity])

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})

it('fails if there is more than 2 items', () => {
  const { error } = postLatLon.validate([1, 2, 3])

  expect(error?.details[0].message).toBe(LATLON_INVALID)
})
