import { Categories } from '../types/common'
import object from './object'
import { addPost } from './partials'

export interface AddPostSchema {
  csrfToken: string
  name: string
  description: string
  categories: Categories[]
  price: number
}

const addPostSchema = object<AddPostSchema>({
  ...addPost,
})

export default addPostSchema
