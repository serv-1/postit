export interface DiscussionsIdGetData {
  _id: string
  postId: string
  postName: string
  channelName: string
  messages: {
    _id: string
    message: string
    createdAt: string
    seen: boolean
    userId?: string
  }[]
  buyerId?: string
  sellerId?: string
  hasNewMessage: boolean
}

export interface DiscussionsIdGetError {
  message: string
}

export type DiscussionsIdPutData = null

export interface DiscussionsIdPutError {
  message: string
}

export type DiscussionsIdDeleteData = null

export interface DiscussionsIdDeleteError {
  message: string
}
