import type { CreatePost } from 'schemas/server/createPost'

export interface PostPostData {
  id: string
}

export interface PostPostError {
  name?: keyof CreatePost
  message: string
}
