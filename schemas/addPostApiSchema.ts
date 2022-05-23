import { Categories, IImage } from '../types/common'
import imagesSchema from './imagesSchema'
import object from './object'
import { addPost } from './partials'

export interface AddPostApiSchema {
  csrfToken: string
  name: string
  description: string
  categories: Categories[]
  price: number
  images: IImage[]
}

const addPostApiSchema = object<AddPostApiSchema>({
  ...addPost,
  images: imagesSchema.required().min(1),
})

export default addPostApiSchema
