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
  name?: string
  message: string
}

export type PostsIdDeleteData = null

export interface PostsIdDeleteError {
  message: string
}
