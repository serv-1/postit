import pageSchema from '../../schemas/pageSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = pageSchema.validate(1)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a number', () => {
  const { error: e } = pageSchema.validate('a')
  expect(e?.details[0].message).toBe(err.PAGE_INVALID)
})

it('fails if the value is infinity', () => {
  const { error: e } = pageSchema.validate(Infinity)
  expect(e?.details[0].message).toBe(err.PAGE_INVALID)
})

it('fails if the value is a negative number', () => {
  const { error: e } = pageSchema.validate(-1)
  expect(e?.details[0].message).toBe(err.PAGE_INVALID)
})
