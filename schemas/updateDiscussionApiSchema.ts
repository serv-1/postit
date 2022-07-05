import csrfTokenSchema from './csrfTokenSchema'
import messageSchema, { MessageSchema } from './messageSchema'
import object from './object'

export interface UpdateDiscussionApiSchema {
  message: MessageSchema
  csrfToken: string
}

const updateDiscussionApiSchema = object<UpdateDiscussionApiSchema>({
  message: messageSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default updateDiscussionApiSchema
