import type { Categories } from '../types'
import imagesFileListSchema from './imagesFileListSchema'
import object from './object'
import { updatePost } from './partials'

export interface UpdatePostSchema {
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: FileList
  address?: string
}

const updatePostSchema = object<UpdatePostSchema>({
  ...updatePost,
  images: imagesFileListSchema,
})

export default updatePostSchema
