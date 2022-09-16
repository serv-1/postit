import categoriesSchema from '../../schemas/categoriesSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = categoriesSchema.validate(['toy'])
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not an array', () => {
  const { error: e } = categoriesSchema.validate('')
  expect(e?.details[0].message).toBe(err.CATEGORIES_INVALID)
})

it('fails if an item is invalid', () => {
  const { error: e } = categoriesSchema.validate([1])
  expect(e?.details[0].message).toBe(err.CATEGORIES_INVALID)
})

it('fails if there is too many items', () => {
  const value = ['toy', 'game', 'auto', 'moto']
  const { error: e } = categoriesSchema.validate(value)
  expect(e?.details[0].message).toBe(err.CATEGORIES_MAX)
})

it('fails if there is duplicated items', () => {
  const { error: e } = categoriesSchema.validate(['toy', 'toy'])
  expect(e?.details[0].message).toBe(err.CATEGORIES_INVALID)
})
