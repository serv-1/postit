import { Categories, IImage } from '../types/common'
import err from '../utils/constants/errors'
import imagesSchema from './imagesSchema'
import latLonSchema from './latLonSchema'
import object from './object'
import { updatePost } from './partials'

export interface UpdatePostApiSchema {
  csrfToken: string
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: IImage[]
  address?: string
  latLon?: [number, number]
}

const updatePostApiSchema = object<UpdatePostApiSchema>({
  ...updatePost,
  images: imagesSchema,
  latLon: latLonSchema,
})
  .and('address', 'latLon')
  .messages({ 'object.and': err.ADDRESS_INVALID })

export default updatePostApiSchema
