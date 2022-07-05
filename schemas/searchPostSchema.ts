import Joi from 'joi'
import { Categories } from '../types/common'
import err from '../utils/constants/errors'
import categoriesSchema from './categoriesSchema'
import addressSchema from './addressSchema'
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
  address?: string
}

const searchPostSchema = object<SearchPostSchema>({
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
  address: addressSchema.allow(''),
})

export default searchPostSchema
