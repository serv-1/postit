import discussionMessage from 'schemas/discussionMessage'
import id from 'schemas/server/id'
import name from 'schemas/name'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface CreateDiscussion {
  message: string
  postId: string
  sellerId: string
  postName: string
}

const createDiscussion = createObjectSchema<CreateDiscussion>({
  message: discussionMessage
    .required()
    .messages({ 'any.required': err.MESSAGE_REQUIRED }),
  postId: id.required().messages({ 'any.required': err.ID_INVALID }),
  sellerId: id.required().messages({ 'any.required': err.ID_INVALID }),
  postName: name.required().messages({ 'any.required': err.NAME_REQUIRED }),
})

export default createDiscussion
