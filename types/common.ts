import categories from '../categories'
import { DiscussionModel, MessageModel } from '../models/Discussion'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'

export interface Post
  extends Omit<PostModel, '_id' | 'userId' | 'latLon' | 'discussionsIds'> {
  id: string
  discussionsIds: string[]
  latLon: [number, number]
  userId: string
}

export interface LightPost
  extends Pick<Post, 'id' | 'name' | 'price' | 'address'> {
  image: string
}

export type LighterPost = Omit<LightPost, 'price' | 'address'>

export interface User
  extends Pick<
    UserModel,
    'name' | 'email' | 'image' | 'channelName' | 'hasUnseenMessages'
  > {
  id: string
  discussionsIds: string[]
  postsIds: string[]
  favPostsIds: string[]
}

export interface Image {
  base64: string
  ext: 'jpg' | 'jpeg' | 'png' | 'gif'
}

export interface Message extends Omit<MessageModel, 'userId'> {
  userId: string
}

export interface Discussion
  extends Pick<DiscussionModel, 'postName' | 'channelName'> {
  id: string
  postId?: string
  buyer: { id?: string; name: string; image: string }
  seller: { id?: string; name: string; image: string }
  messages: Message[]
}

export type JSONDiscussion = Omit<Discussion, 'messages'> & {
  messages: (Omit<Message, 'createdAt'> & { createdAt: string })[]
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
