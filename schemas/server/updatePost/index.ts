import type { Categories } from 'types'
import err from 'utils/constants/errors'
import postLatLon from 'schemas/postLatLon'
import name from 'schemas/name'
import postDescription from 'schemas/postDescription'
import postCategories from 'schemas/postCategories'
import postPrice from 'schemas/postPrice'
import postAddress from 'schemas/postAddress'
import createObjectSchema from 'utils/functions/createObjectSchema'
import postImages from 'schemas/postImages'

export interface UpdatePost {
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: string[]
  address?: string
  latLon?: [number, number]
}

const updatePost = createObjectSchema<UpdatePost>({
  name: name.allow(''),
  description: postDescription.allow(''),
  categories: postCategories,
  price: postPrice
    .allow('')
    .min(1)
    .messages({ 'number.min': err.PRICE_INVALID }),
  address: postAddress.allow(''),
  images: postImages,
  latLon: postLatLon,
})
  .or(
    'name',
    'description',
    'categories',
    'price',
    'images',
    'address',
    'latLon'
  )
  .and('address', 'latLon')
  .messages({
    'object.and': err.ADDRESS_INVALID,
    'object.missing': err.DATA_INVALID,
  })

export default updatePost
