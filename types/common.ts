import categories from '../categories'
import { DiscussionModel, MessageModel } from '../models/Discussion'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'

export interface IPost
  extends Omit<PostModel, '_id' | 'userId' | 'latLon' | 'discussionsIds'> {
  id: string
  discussionsIds: string[]
  latLon: [number, number]
  user: Pick<IUser, 'id' | 'name' | 'email' | 'image'> & { posts: ILightPost[] }
}

export interface ILightPost
  extends Pick<IPost, 'id' | 'name' | 'price' | 'address'> {
  image: string
}

export type IFavPost = Omit<ILightPost, 'price'>
export type IUserPost = Omit<IPost, 'user'>

export interface IUser
  extends Pick<
    UserModel,
    'name' | 'email' | 'image' | 'channelName' | 'hasUnseenMessages'
  > {
  id: string
  discussionsIds: string[]
  posts: IUserPost[]
  favPosts: IFavPost[]
}

export interface IImage {
  base64: string
  ext: 'jpg' | 'jpeg' | 'png' | 'gif'
}

export interface IMessage extends Omit<MessageModel, 'userId'> {
  userId: string
}

export interface IDiscussion
  extends Pick<DiscussionModel, 'postName' | 'channelName'> {
  id: string
  postId?: string
  buyer: { id?: string; name: string; image: string }
  seller: { id?: string; name: string; image: string }
  messages: IMessage[]
}

export type JSONDiscussion = Omit<IDiscussion, 'messages'> & {
  messages: (Omit<IMessage, 'createdAt'> & { createdAt: string })[]
}

export type Categories = typeof categories[0]

export type Entries<O> = {
  [K in keyof O]-?: [K, O[K]]
}[keyof O][]

export type UnPromise<T> = T extends Promise<infer U> ? U : T
export type UnArray<T> = T extends Array<infer U> ? U : T

export interface DeferredPromise<T extends unknown> {
  resolve: (value: T) => void
  reject: (reason?: any) => void
}

export interface DiscussionEventData {
  discussionId: string
  userId: string
}
