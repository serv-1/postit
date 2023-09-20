import type { AddUserSchema } from 'schemas/addUserSchema'

export interface UserPostData {
  id: string
}

export interface UserPostError {
  message: string
  name?: keyof AddUserSchema
}

export type UserPutData = null

export interface UserPutError {
  message: string
}

export type UserDeleteData = null

export interface UserDeleteError {
  message: string
}
