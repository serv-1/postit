import Joi from 'joi'
import type { Categories } from 'types'
import postCategories from 'schemas/postCategories'
import postAddress from 'schemas/postAddress'
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
  minPrice?: string
  maxPrice?: string
  categories: Categories[]
  address?: string
}

const searchPost = createObjectSchema<SearchPost>({
  query: searchPostQuery
    .required()
    .messages({ 'any.required': QUERY_REQUIRED }),
  minPrice: postPrice.allow(''),
  maxPrice: postPrice
    .allow('')
    .min(Joi.ref('minPrice', { adjust: (price) => price || 0 }))
    .messages({ 'number.min': MAX_PRICE_MIN }),
  categories: postCategories
    .required()
    .messages({ 'any.required': CATEGORIES_REQUIRED }),
  address: postAddress.allow(''),
})

export default searchPost
