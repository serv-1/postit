import categories from '../categories'
import { IPost } from '../models/Post'
import { IUser } from '../models/User'

export interface Post extends Omit<IPost, '_id' | 'userId'> {
  id: string
  userId: string
}

export interface User
  extends Omit<IUser, '_id' | 'postsIds' | 'password' | 'emailVerified'> {
  id: string
  postsIds: string[]
}

export interface Image {
  base64: string
  ext: 'jpeg' | 'png' | 'gif'
}

export type Categories = typeof categories[0]
