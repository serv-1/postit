import csrfTokenSchema from './csrfTokenSchema'
import idSchema from './idSchema'
import messageSchema from './messageSchema'
import nameSchema from './nameSchema'
import object from './object'

export interface AddDiscussionApiSchema {
  message: string
  postId: string
  sellerId: string
  postName: string
  csrfToken: string
}

const addDiscussionApiSchema = object<AddDiscussionApiSchema>({
  message: messageSchema.required(),
  postId: idSchema.required(),
  sellerId: idSchema.required(),
  postName: nameSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default addDiscussionApiSchema
