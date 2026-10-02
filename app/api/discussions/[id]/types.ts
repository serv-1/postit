export interface DiscussionsIdGetData {
  _id: string
  postId: string
  postName: string
  messages: {
    _id: string
    message: string
    createdAt: string
    seen: boolean
    userId?: string
  }[]
  buyerId?: string
  sellerId?: string
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
