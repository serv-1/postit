import object from './object'
import messageSchema from './messageSchema'
import channelNameSchema from './channelNameSchema'

export interface ChatApiSchema {
  message: {
    message: string
    createdAt: Date
    userId: string
  }
  channelName: string
}

const chatApiSchema = object<ChatApiSchema>({
  message: messageSchema.required(),
  channelName: channelNameSchema.required(),
})

export default chatApiSchema
