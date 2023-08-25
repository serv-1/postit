import Joi from 'joi'
import validate from '.'

it('only returns the validated value if there is no error', () => {
  const schema = Joi.object({ a: Joi.string() })
  const value = { a: 'a' }

  expect(validate(schema, value)).toEqual({ value })
})

it('returns the validated value with the error name and message', () => {
  const schema = Joi.object({ a: Joi.string() })
  const value = 1

  const result = validate(schema, value)

  expect(result).toHaveProperty('value', value)
  expect(result).toHaveProperty('name')
  expect(result).toHaveProperty('message')
})
