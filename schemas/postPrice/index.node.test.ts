import { PRICE_INVALID } from 'constants/errors'
import postPrice from '.'

it('passes', () => {
  const result = postPrice.validate(12)

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('rounds the value to 2 decimals places', () => {
  const result = postPrice.validate(12.1234)

  expect(result.value).toBe(12.12)
})

it('fails if the value is infinity', () => {
  const { error } = postPrice.validate(Infinity)

  expect(error?.details[0].message).toBe(PRICE_INVALID)
})

it('fails if the value is not a number', () => {
  const { error } = postPrice.validate('no')

  expect(error?.details[0].message).toBe(PRICE_INVALID)
})

it('fails if the value is negative', () => {
  const { error } = postPrice.validate(-1)

  expect(error?.details[0].message).toBe(PRICE_INVALID)
})
