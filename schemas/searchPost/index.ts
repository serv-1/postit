import Joi from 'joi'
import type { Categories } from 'types'
import err from 'utils/constants/errors'
import postCategories from 'schemas/postCategories'
import postAddress from 'schemas/postAddress'
import pageNumber from 'schemas/pageNumber'
import postPrice from 'schemas/postPrice'
import searchPostQuery from 'schemas/searchPostQuery'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface SearchPost {
  query: string
  page?: string | null
  minPrice?: string | null
  maxPrice?: string | null
  categories: Categories[]
  address?: string | null
}

const searchPost = createObjectSchema<SearchPost>({
  query: searchPostQuery
    .required()
    .messages({ 'any.required': err.QUERY_REQUIRED }),
  page: pageNumber.allow(null),
  minPrice: postPrice.allow(null),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: null,
    then: postPrice.allow(null),
    otherwise: postPrice
      .allow(null)
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: postCategories
    .required()
    .messages({ 'any.required': err.CATEGORIES_REQUIRED }),
  address: postAddress.allow(null),
})

export default searchPost
