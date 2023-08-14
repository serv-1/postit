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
  page: string | null
  minPrice: string | null
  maxPrice: string | null
  categories: Categories[]
  address: string | null
}

const searchPostSchema = object<SearchPostSchema>({
  query: querySchema.required(),
  page: pageSchema.required().allow(null),
  minPrice: priceSchema.required().allow(null).default(0),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: null,
    then: priceSchema.required().allow(null),
    otherwise: priceSchema
      .required()
      .allow(null)
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: categoriesSchema.required(),
  address: addressSchema.required().allow(null),
})

export default searchPostSchema
