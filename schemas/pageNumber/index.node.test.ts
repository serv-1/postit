import { PAGE_INVALID } from 'constants/errors'
import pageSchema from '.'

it('passes', () => {
  const result = pageSchema.validate(1)

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the value is not a number', () => {
  const { error } = pageSchema.validate('a')

  expect(error?.details[0].message).toBe(PAGE_INVALID)
})

it('fails if the value is infinity', () => {
  const { error } = pageSchema.validate(Infinity)

  expect(error?.details[0].message).toBe(PAGE_INVALID)
})

it('fails if the value is a negative number', () => {
  const { error } = pageSchema.validate(-1)

  expect(error?.details[0].message).toBe(PAGE_INVALID)
})
