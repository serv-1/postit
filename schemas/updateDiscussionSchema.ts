import messageSchema from './messageSchema'
import object from './object'

export interface UpdateDiscussionSchema {
  message: string
}

const updateDiscussionSchema = object({
  message: messageSchema.required(),
})

export default updateDiscussionSchema
