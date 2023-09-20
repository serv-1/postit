import type { Categories } from '../types'
import object from './object'
import { addPost } from './partials'

export interface AddPostSchema {
  name: string
  description: string
  categories: Categories[]
  price: number
  address: string
}

const addPostSchema = object<AddPostSchema>({
  ...addPost,
})

export default addPostSchema
