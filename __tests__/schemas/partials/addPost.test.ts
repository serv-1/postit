import Joi from 'joi'
import { addPost } from '../../../schemas/partials'
import err from '../../../utils/constants/errors'

const VALUE = {
  name: 'table',
  description: 'magnificent table',
  categories: ['furniture'],
  price: 20,
  location: 'Oslo, Norway',
  csrfToken: 'csrfToken',
}

it('passes', () => {
  const result = Joi.object(addPost).validate(VALUE)
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('warning')
})

it('fails when any property is undefined', () => {
  let error = Joi.object(addPost).validate({ ...VALUE, name: undefined }).error
  expect(error?.details[0].message).toBe(err.NAME_REQUIRED)

  const v1 = { ...VALUE, description: undefined }
  error = Joi.object(addPost).validate(v1).error
  expect(error?.details[0].message).toBe(err.DESCRIPTION_REQUIRED)

  const v2 = { ...VALUE, categories: undefined }
  error = Joi.object(addPost).validate(v2).error
  expect(error?.details[0].message).toBe(err.CATEGORIES_REQUIRED)

  const v3 = { ...VALUE, price: undefined }
  error = Joi.object(addPost).validate(v3).error
  expect(error?.details[0].message).toBe(err.PRICE_REQUIRED)

  const v4 = { ...VALUE, location: undefined }
  error = Joi.object(addPost).validate(v4).error
  expect(error?.details[0].message).toBe(err.LOCATION_REQUIRED)
})

it("fails when the minimum value isn't reached", () => {
  let error = Joi.object(addPost).validate({ ...VALUE, categories: [] }).error
  expect(error?.details[0].message).toBe(err.CATEGORIES_REQUIRED)

  error = Joi.object(addPost).validate({ ...VALUE, price: 0 }).error
  expect(error?.details[0].message).toBe(err.PRICE_INVALID)
})
