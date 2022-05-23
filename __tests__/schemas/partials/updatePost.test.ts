import Joi from 'joi'
import { updatePost } from '../../../schemas/partials'
import err from '../../../utils/constants/errors'

const VALUE = {
  name: 'table',
  description: 'magnificent table',
  categories: ['furniture'],
  price: 20,
  csrfToken: 'csrfToken',
}

it('passes', () => {
  const result = Joi.object(updatePost).validate(VALUE)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('allows name, description and price to be an empty string', () => {
  let result = Joi.object(updatePost).validate({ ...VALUE, name: '' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = Joi.object(updatePost).validate({ ...VALUE, description: '' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')

  result = Joi.object(updatePost).validate({ ...VALUE, price: '' })
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails if the price is smaller than 1', () => {
  const { error: e } = Joi.object(updatePost).validate({ ...VALUE, price: 0 })
  expect(e?.details[0].message).toBe(err.PRICE_INVALID)
})
