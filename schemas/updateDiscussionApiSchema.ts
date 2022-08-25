import csrfTokenSchema from './csrfTokenSchema'
import messageSchema from './messageSchema'
import object from './object'

export type UpdateDiscussionApiSchema = {
  csrfToken: string
  message?: string
}

const updateDiscussionApiSchema = object<UpdateDiscussionApiSchema>({
  message: messageSchema,
  csrfToken: csrfTokenSchema,
})

export default updateDiscussionApiSchema
