import type { UpdatePost } from 'schemas/server/updatePost'
import type { Categories } from 'types'

export interface PostsIdGetData {
  id: string
  name: string
  description: string
  categories: Categories[]
  price: number
  images: string[]
  address: string
  latLon: [number, number]
  discussionIds: string[]
  userId: string
}

export interface PostsIdGetError {
  message: string
}

export type PostsIdPutData = null

export interface PostsIdPutError {
  name?: keyof UpdatePost
  message: string
}

export type PostsIdDeleteData = null

export interface PostsIdDeleteError {
  message: string
}
