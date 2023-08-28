import messageSchema from './messageSchema'
import object from './object'

export type UpdateDiscussionApiSchema = {
  message: string
}

const updateDiscussionApiSchema = object<UpdateDiscussionApiSchema>({
  message: messageSchema.required(),
})

export default updateDiscussionApiSchema
