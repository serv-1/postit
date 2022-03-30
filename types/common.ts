import categories from '../categories'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'

export interface IPost extends Omit<PostModel, '_id' | 'userId'> {
  id: string
  user: Omit<IUser, 'posts'> & { posts: ILightPost[] }
}

export interface ILightPost
  extends Omit<IPost, 'user' | 'categories' | 'description' | 'images'> {
  image: string
}

export interface IUser
  extends Omit<UserModel, '_id' | 'postsIds' | 'password' | 'emailVerified'> {
  id: string
  posts: IUserPost[]
}

export type IUserPost = Omit<IPost, 'user'>

export interface IImage {
  base64: string
  ext: 'jpeg' | 'png' | 'gif'
}

export type Categories = typeof categories[0]

export type Entries<O> = {
  [K in keyof O]-?: [K, O[K]]
}[keyof O][]
