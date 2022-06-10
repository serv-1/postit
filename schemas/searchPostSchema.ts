import Joi from 'joi'
import { Categories } from '../types/common'
import err from '../utils/constants/errors'
import categoriesSchema from './categoriesSchema'
import locationSchema from './locationSchema'
import object from './object'
import pageSchema from './pageSchema'
import priceSchema from './priceSchema'
import querySchema from './querySchema'

export interface SearchPostSchema {
  query: string
  page?: number
  minPrice?: string
  maxPrice?: string
  categories?: Categories[]
  location?: string
}

const searchPostSchema = object({
  query: querySchema.required(),
  page: pageSchema,
  minPrice: priceSchema.allow('').default(0),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: '',
    then: priceSchema.allow(''),
    otherwise: priceSchema
      .allow('')
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: categoriesSchema,
  location: locationSchema,
})

export default searchPostSchema
