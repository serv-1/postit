import { CATEGORIES_INVALID, CATEGORIES_MAX } from 'constants/errors'
import postCategories from '.'

it('passes', () => {
  const result = postCategories.validate(['toy'])

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it("fails if the value isn't an array", () => {
  const { error } = postCategories.validate('')

  expect(error?.details[0].message).toBe(CATEGORIES_INVALID)
})

it('fails if a category is invalid', () => {
  const { error } = postCategories.validate([1])

  expect(error?.details[0].message).toBe(CATEGORIES_INVALID)
})

it('fails if there is too many categories', () => {
  const { error } = postCategories.validate(['toy', 'game', 'auto', 'moto'])

  expect(error?.details[0].message).toBe(CATEGORIES_MAX)
})

it('fails if there is duplicated categories', () => {
  const { error } = postCategories.validate(['toy', 'toy'])

  expect(error?.details[0].message).toBe(CATEGORIES_INVALID)
})
