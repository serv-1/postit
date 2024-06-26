import Joi from 'joi'
import type { Categories } from 'types'
import postCategories from 'schemas/postCategories'
import postAddress from 'schemas/postAddress'
import pageNumber from 'schemas/pageNumber'
import postPrice from 'schemas/postPrice'
import searchPostQuery from 'schemas/searchPostQuery'
import createObjectSchema from 'functions/createObjectSchema'
import {
  QUERY_REQUIRED,
  MAX_PRICE_MIN,
  CATEGORIES_REQUIRED,
} from 'constants/errors'

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
    .messages({ 'any.required': QUERY_REQUIRED }),
  page: pageNumber.allow(null),
  minPrice: postPrice.allow(null),
  maxPrice: postPrice
    .allow(null)
    .min(Joi.ref('minPrice', { adjust: (price) => price || 0 }))
    .messages({ 'number.min': MAX_PRICE_MIN }),
  categories: postCategories
    .required()
    .messages({ 'any.required': CATEGORIES_REQUIRED }),
  address: postAddress.allow(null),
})

export default searchPost
