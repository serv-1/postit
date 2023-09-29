import type { Categories } from 'types'
import name from 'schemas/name'
import postDescription from 'schemas/postDescription'
import postCategories from 'schemas/postCategories'
import postPrice from 'schemas/postPrice'
import postAddress from 'schemas/postAddress'
import createObjectSchema from 'functions/createObjectSchema'
import {
  NAME_REQUIRED,
  DESCRIPTION_REQUIRED,
  CATEGORIES_REQUIRED,
  PRICE_REQUIRED,
  PRICE_INVALID,
  ADDRESS_REQUIRED,
} from 'constants/errors'

export interface CreatePost {
  name: string
  description: string
  categories: Categories[]
  price: number
  address: string
}

const createPost = createObjectSchema<CreatePost>({
  name: name.required().messages({ 'any.required': NAME_REQUIRED }),
  description: postDescription
    .required()
    .messages({ 'any.required': DESCRIPTION_REQUIRED }),
  categories: postCategories.required().min(1).messages({
    'any.required': CATEGORIES_REQUIRED,
    'array.min': CATEGORIES_REQUIRED,
  }),
  price: postPrice.required().min(1).messages({
    'any.required': PRICE_REQUIRED,
    'number.min': PRICE_INVALID,
  }),
  address: postAddress
    .required()
    .messages({ 'any.required': ADDRESS_REQUIRED }),
})

export default createPost
