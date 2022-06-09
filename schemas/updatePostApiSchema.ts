import { Categories, IImage } from '../types/common'
import imagesSchema from './imagesSchema'
import object from './object'
import { updatePost } from './partials'

export interface UpdatePostApiSchema {
  csrfToken: string
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: IImage[]
  location?: string
}

const updatePostApiSchema = object<UpdatePostApiSchema>({
  ...updatePost,
  images: imagesSchema,
})

export default updatePostApiSchema
