import Joi from 'joi'
import createObjectSchema from '.'
import err from 'utils/constants/errors'

it('passes', () => {
  const result = createObjectSchema({ a: Joi.number() }).validate({ a: 0 })

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it("fails if the value isn't an object", () => {
  const { error } = createObjectSchema({}).validate('')

  expect(error?.details[0].message).toBe(err.DATA_INVALID)
})

it('fails if the value is undefined', () => {
  const { error } = createObjectSchema({}).validate(undefined)

  expect(error?.details[0].message).toBe(err.DATA_INVALID)
})

it('fails if there is an unknown property', () => {
  const { error } = createObjectSchema({}).validate({ a: 0 })

  expect(error?.details[0].message).toBe(err.DATA_INVALID)
})
