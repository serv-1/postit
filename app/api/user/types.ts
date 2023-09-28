import type { CreateUser } from 'schemas/createUser'

export interface UserPostData {
  id: string
}

export interface UserPostError {
  message: string
  name?: keyof CreateUser
}

export type UserPutData = null

export interface UserPutError {
  message: string
}

export type UserDeleteData = null

export interface UserDeleteError {
  message: string
}
