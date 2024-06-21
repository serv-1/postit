import { CATEGORIES } from 'constants/index'
import type { PostsIdGetData } from 'app/api/posts/[id]/types'
import type { UsersIdGetData } from 'app/api/users/[id]/types'
import type { DiscussionsIdGetData } from 'app/api/discussions/[id]/types'

export type Post = PostsIdGetData

export type User = UsersIdGetData

export type Discussion = DiscussionsIdGetData

export type Categories = UnArray<typeof CATEGORIES>

export type Entries<O> = {
  [K in keyof O]-?: [K, O[K]]
}[keyof O][]

export type UnPromise<T> = T extends Promise<infer U> ? U : T

export type UnArray<T> = T extends Array<infer U> | ReadonlyArray<infer U>
  ? U
  : T

export interface DeferredPromise<T extends unknown> {
  resolve: (value: T) => void
  reject: (reason?: any) => void
}
