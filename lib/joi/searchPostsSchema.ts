import Joi from 'joi'
import { Categories } from '../../types/common'
import err from '../../utils/constants/errors'
import { categoriesSchema } from './categoriesSchema'
import object from './object'
import { pageSchema } from './pageSchema'
import { priceSchema } from './priceSchema'
import { querySchema } from './querySchema'

export interface SearchPostsSchema {
  query: string
  page?: string
  minPrice?: string
  maxPrice?: string
  categories?: Categories[]
}

export const searchPostsSchema = object<SearchPostsSchema>({
  query: querySchema,
  page: pageSchema.optional(),
  minPrice: priceSchema.optional().allow('').min(0).default(0),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: '',
    then: priceSchema.optional().allow('').min(0),
    otherwise: priceSchema
      .optional()
      .allow('')
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: categoriesSchema.optional().min(0),
})
