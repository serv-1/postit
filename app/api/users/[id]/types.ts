export interface UsersIdGetData {
  id: string
  name: string
  email: string
  channelName: string
  image?: string
  postIds: string[]
  favPostIds: string[]
  discussions: {
    id: string
    hidden: boolean
    hasNewMessage: boolean
  }[]
}

export interface UsersIdGetError {
  message: string
}
