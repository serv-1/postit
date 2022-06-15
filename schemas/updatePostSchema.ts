import { Categories } from '../types/common'
import imagesFileListSchema from './imagesFileListSchema'
import object from './object'
import { updatePost } from './partials'

export interface UpdatePostSchema {
  csrfToken: string
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
