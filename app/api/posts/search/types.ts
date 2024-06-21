import type { Post } from 'types'

export interface PostsSearchGetData {
  posts: Post[]
  totalPosts: number
  totalPages: number
}

export interface PostsSearchGetError {
  message: string
}
