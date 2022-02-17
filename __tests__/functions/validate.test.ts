import Joi from 'joi'
import validate from '../../utils/functions/validate'

it('only return the validated value if there is no error', () => {
  const schema = Joi.object({ a: Joi.string() })
  const value = { a: 'a' }

  const result = validate(schema, value)

  expect(result).toEqual({ value })
})

it('return the validated value with the error name and message', () => {
  const schema = Joi.object({ a: Joi.string() })
  const value = 1

  const result = validate(schema, value)

  expect(result).toHaveProperty('value', value)
  expect(result).toHaveProperty('name')
  expect(result).toHaveProperty('message')
})
