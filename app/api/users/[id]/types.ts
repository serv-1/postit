export interface UsersIdGetData {
  _id: string
  name: string
  email: string
  channelName: string
  image?: string
  postIds: string[]
  favPostIds: string[]
  discussions: {
    _id: string
    id: string
    hidden: boolean
    hasNewMessage: boolean
  }[]
}

export interface UsersIdGetError {
  message: string
}
