import { Categories } from '../types/common'
import err from '../utils/constants/errors'
import imagesSchema from './imagesSchema'
import latLonSchema from './latLonSchema'
import object from './object'
import { updatePost } from './partials'

export interface UpdatePostApiSchema {
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: string[]
  address?: string
  latLon?: [number, number]
}

const updatePostApiSchema = object<UpdatePostApiSchema>({
  ...updatePost,
  images: imagesSchema,
  latLon: latLonSchema,
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

export default updatePostApiSchema
