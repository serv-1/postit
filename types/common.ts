import { IPost } from '../models/Post'

export interface Post extends Omit<IPost, '_id' | 'images' | 'userId'> {
  id: string
  images: string[]
  userId: string
}

export interface Image {
  base64: string
  type: 'jpeg' | 'png' | 'gif'
}
