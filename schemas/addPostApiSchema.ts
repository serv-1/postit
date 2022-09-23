import { Categories } from '../types/common'
import imagesSchema from './imagesSchema'
import latLonSchema from './latLonSchema'
import object from './object'
import { addPost } from './partials'

export interface AddPostApiSchema {
  csrfToken: string
  name: string
  description: string
  categories: Categories[]
  price: number
  images: string[]
  address: string
  latLon: [number, number]
}

const addPostApiSchema = object<AddPostApiSchema>({
  ...addPost,
  images: imagesSchema.required().min(1),
  latLon: latLonSchema.required(),
})

export default addPostApiSchema
