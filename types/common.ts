import categories from '../categories'
import { DiscussionModel } from '../models/Discussion'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'

export interface IPost extends Omit<PostModel, '_id' | 'userId' | 'latLon'> {
  id: string
  latLon: [number, number]
  user: Omit<IUser, 'posts'> & { posts: ILightPost[] }
}

export interface ILightPost
  extends Omit<
    IPost,
    'user' | 'categories' | 'description' | 'images' | 'latLon'
  > {
  image: string
}

export type IFavPost = Omit<ILightPost, 'price'>
export type IUserPost = Omit<IPost, 'user'>

export interface IUser
  extends Omit<
    UserModel,
    '_id' | 'postsIds' | 'favPostsIds' | 'password' | 'emailVerified'
  > {
  id: string
  posts: IUserPost[]
  favPosts: IFavPost[]
}

export interface IImage {
  base64: string
  ext: 'jpg' | 'jpeg' | 'png' | 'gif'
}

export interface IDiscussion
  extends Omit<DiscussionModel, '_id' | 'postId' | 'buyerId' | 'sellerId'> {
  id: string
  postId?: string
  buyerId?: string
  sellerId?: string
}

export type Categories = typeof categories[0]

export type Entries<O> = {
  [K in keyof O]-?: [K, O[K]]
}[keyof O][]

export type UnPromise<T> = T extends Promise<infer U> ? U : T
