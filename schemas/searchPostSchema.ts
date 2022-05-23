import Joi from 'joi'
import { Categories } from '../types/common'
import err from '../utils/constants/errors'
import categoriesSchema from './categoriesSchema'
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
}

const searchPostSchema = object({
  query: querySchema,
  page: pageSchema,
  minPrice: priceSchema.allow(''),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: '',
    then: priceSchema.allow(''),
    otherwise: priceSchema
      .allow('')
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: categoriesSchema,
})

export default searchPostSchema
