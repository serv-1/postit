import categories from '../categories'
import { IPost } from '../models/Post'

export interface Post extends Omit<IPost, '_id' | 'userId'> {
  id: string
  userId: string
}

export interface Image {
  base64: string
  type: 'jpeg' | 'png' | 'gif'
}

export type Categories = typeof categories[0]
