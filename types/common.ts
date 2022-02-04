import { IPost } from '../models/Post'

export interface Post extends Omit<IPost, '_id' | 'images' | 'userId'> {
  id: string
  images: string[]
  userId: string
}
