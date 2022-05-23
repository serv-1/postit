import categoriesSchema from '../../schemas/categoriesSchema'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = categoriesSchema.validate(['pet'])
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
  const { error: e } = categoriesSchema.validate(['pet', 'cat', 'dog', 'bird'])
  expect(e?.details[0].message).toBe(err.CATEGORIES_MAX)
})

it('fails if there is duplicated items', () => {
  const { error: e } = categoriesSchema.validate(['pet', 'pet'])
  expect(e?.details[0].message).toBe(err.CATEGORIES_INVALID)
})
