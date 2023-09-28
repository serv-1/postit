import type { Categories } from 'types'
import name from 'schemas/name'
import postDescription from 'schemas/postDescription'
import postCategories from 'schemas/postCategories'
import postPrice from 'schemas/postPrice'
import postAddress from 'schemas/postAddress'
import postImages from 'schemas/postImages'
import postLatLon from 'schemas/postLatLon'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

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
    'any.required': err.NAME_REQUIRED,
  }),
  description: postDescription.required().messages({
    'any.required': err.DESCRIPTION_REQUIRED,
  }),
  categories: postCategories.required().min(1).messages({
    'any.required': err.CATEGORIES_REQUIRED,
    'array.min': err.CATEGORIES_REQUIRED,
  }),
  price: postPrice.required().min(1).messages({
    'any.required': err.PRICE_REQUIRED,
    'number.min': err.PRICE_INVALID,
  }),
  address: postAddress.required().messages({
    'any.required': err.ADDRESS_REQUIRED,
  }),
  images: postImages.required().min(1).messages({
    'any.required': err.IMAGES_REQUIRED,
    'array.min': err.IMAGES_REQUIRED,
  }),
  latLon: postLatLon.required().messages({
    'any.required': err.LATLON_REQUIRED,
  }),
})

export default createPost
