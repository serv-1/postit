import priceSchema from '../../schemas/priceSchema'
import err from '../../utils/constants/errors'

it('passes and is rounded to 2 decimals places', () => {
  const result = priceSchema.validate(12.1254)
  expect(result.value).toBe(12.13)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is infinity', () => {
  const { error: e } = priceSchema.validate(Infinity)
  expect(e?.details[0].message).toBe(err.PRICE_INVALID)
})

it('fails if the value is not a number', () => {
  const { error: e } = priceSchema.validate('no')
  expect(e?.details[0].message).toBe(err.PRICE_INVALID)
})

it('fails if the value is negative', () => {
  const { error: e } = priceSchema.validate(-1)
  expect(e?.details[0].message).toBe(err.PRICE_INVALID)
})
