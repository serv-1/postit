import Joi from 'joi'
import object from '../../schemas/object'
import err from '../../utils/constants/errors'

it('passes', () => {
  const result = object({ a: Joi.number() }).validate({ a: 0 })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if it is not an object', () => {
  const { error: e } = object({}).validate('')
  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})

it('fails if it is undefined', () => {
  const { error: e } = object({}).validate(undefined)
  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})

it('fails there is an unknown property', () => {
  const { error: e } = object({}).validate({ a: 0 })
  expect(e?.details[0].message).toBe(err.DATA_INVALID)
})
