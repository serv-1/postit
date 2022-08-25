import csrfTokenSchema from './csrfTokenSchema'
import messageSchema from './messageSchema'
import object from './object'

export interface UpdateDiscussionSchema {
  message: string
  csrfToken: string
}

const updateDiscussionSchema = object({
  message: messageSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default updateDiscussionSchema
