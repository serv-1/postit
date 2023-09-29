import type { Categories } from 'types'
import name from 'schemas/name'
import postDescription from 'schemas/postDescription'
import postCategories from 'schemas/postCategories'
import postPrice from 'schemas/postPrice'
import postAddress from 'schemas/postAddress'
import postImages from 'schemas/postImages'
import postLatLon from 'schemas/postLatLon'
import createObjectSchema from 'functions/createObjectSchema'
import {
  NAME_REQUIRED,
  DESCRIPTION_REQUIRED,
  CATEGORIES_REQUIRED,
  PRICE_REQUIRED,
  PRICE_INVALID,
  ADDRESS_REQUIRED,
  IMAGES_REQUIRED,
  LATLON_REQUIRED,
} from 'constants/errors'

export interface CreatePost {
  name: string
  description: string
  categories: Categories[]
  price: number
  images: string[]
  address: string
  latLon: [number, number]
}

const createPost = createObjectSchema<CreatePost>({
  name: name.required().messages({
    'any.required': NAME_REQUIRED,
  }),
  description: postDescription.required().messages({
    'any.required': DESCRIPTION_REQUIRED,
  }),
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
  images: postImages.required().min(1).messages({
    'any.required': IMAGES_REQUIRED,
    'array.min': IMAGES_REQUIRED,
  }),
  latLon: postLatLon.required().messages({
    'any.required': LATLON_REQUIRED,
  }),
})

export default createPost
