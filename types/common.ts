import categories from '../categories'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'

export interface IPost extends Omit<PostModel, '_id' | 'userId'> {
  id: string
  userId: string
}

export interface IUser
  extends Omit<UserModel, '_id' | 'postsIds' | 'password' | 'emailVerified'> {
  id: string
  postsIds: string[]
}

export interface IImage {
  base64: string
  ext: 'jpeg' | 'png' | 'gif'
}

export type Categories = typeof categories[0]

export type Entries<O> = {
  [K in keyof O]-?: [K, O[K]]
}[keyof O][]
