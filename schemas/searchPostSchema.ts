import Joi from 'joi'
import type { Categories } from '../types'
import err from '../utils/constants/errors'
import categoriesSchema from './categoriesSchema'
import addressSchema from './addressSchema'
import object from './object'
import pageSchema from './pageSchema'
import priceSchema from './priceSchema'
import querySchema from './querySchema'

export interface SearchPostSchema {
  query: string
  page?: string | null
  minPrice?: string | null
  maxPrice?: string | null
  categories: Categories[]
  address?: string | null
}

const searchPostSchema = object<SearchPostSchema>({
  query: querySchema.required(),
  page: pageSchema.allow(null),
  minPrice: priceSchema.allow(null).default(0),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: null,
    then: priceSchema.allow(null),
    otherwise: priceSchema
      .allow(null)
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: categoriesSchema.required(),
  address: addressSchema.allow(null),
})

export default searchPostSchema
