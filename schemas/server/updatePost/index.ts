import type { Categories } from 'types'
import postLatLon from 'schemas/postLatLon'
import name from 'schemas/name'
import postDescription from 'schemas/postDescription'
import postCategories from 'schemas/postCategories'
import postPrice from 'schemas/postPrice'
import postAddress from 'schemas/postAddress'
import createObjectSchema from 'functions/createObjectSchema'
import postImages from 'schemas/postImages'
import { PRICE_INVALID, ADDRESS_INVALID, DATA_INVALID } from 'constants/errors'
import Joi from 'joi'

export interface UpdatePost {
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: string[]
  location?: {
    address?: string
    latLon?: [number, number]
  }
}

const updatePost = createObjectSchema<UpdatePost>({
  name: name.allow(''),
  description: postDescription.allow(''),
  categories: postCategories,
  price: postPrice.allow('').min(1).messages({ 'number.min': PRICE_INVALID }),
  images: postImages,
  location: Joi.object({
    address: postAddress
      .required()
      .messages({ 'any.required': ADDRESS_INVALID }),
    latLon: postLatLon.required().messages({ 'any.required': ADDRESS_INVALID }),
  })
    .unknown(false)
    .messages({ 'object.unknown': ADDRESS_INVALID }),
})
  .or('name', 'description', 'categories', 'price', 'images', 'location')
  .messages({
    'object.missing': DATA_INVALID,
  })

export default updatePost
