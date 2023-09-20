export interface UsersIdGetData {
  id: string
  name: string
  email: string
  hasUnseenMessages: boolean
  channelName: string
  image?: string
  postIds: string[]
  favPostIds: string[]
  discussionIds: string[]
}

export interface UsersIdGetError {
  message: string
}
