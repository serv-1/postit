export interface DiscussionsIdGetData {
  id: string
  postId: string
  postName: string
  channelName: string
  messages: {
    message: string
    createdAt: string
    userId: string
    seen: boolean
  }[]
  buyer: {
    id?: string
    name: string
    image?: string
  }
  seller: {
    id?: string
    name: string
    image?: string
  }
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
