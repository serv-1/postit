import { Categories } from '../types/common'
import imagesFileListSchema from './imagesFileListSchema'
import object from './object'
import { addPost } from './partials'

export interface AddPostSchema {
  csrfToken: string
  name: string
  description: string
  categories: Categories[]
  price: number
  images: FileList
}

const addPostSchema = object<AddPostSchema>({
  ...addPost,
  images: imagesFileListSchema.required().min(1),
})

export default addPostSchema
