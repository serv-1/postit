import csrfTokenSchema from './csrfTokenSchema'
import idSchema from './idSchema'
import messageSchema, { MessageSchema } from './messageSchema'
import nameSchema from './nameSchema'
import object from './object'

export interface AddDiscussionApiSchema {
  message: MessageSchema
  postId: string
  sellerId: string
  postName: string
  csrfToken: string
}

const addDiscussionApiSchema = object<AddDiscussionApiSchema>({
  message: messageSchema,
  postId: idSchema.required(),
  sellerId: idSchema.required(),
  postName: nameSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default addDiscussionApiSchema
