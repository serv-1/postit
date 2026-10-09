import discussionMessage from 'schemas/discussionMessage'
import id from 'schemas/server/id'
import createObjectSchema from 'functions/createObjectSchema'
import { MESSAGE_REQUIRED, ID_INVALID } from 'constants/errors'

export interface CreateDiscussion {
  message: string
  postId: string
  sellerId: string
}

const createDiscussion = createObjectSchema<CreateDiscussion>({
  message: discussionMessage
    .required()
    .messages({ 'any.required': MESSAGE_REQUIRED }),
  postId: id.required().messages({ 'any.required': ID_INVALID }),
  sellerId: id.required().messages({ 'any.required': ID_INVALID }),
})

export default createDiscussion
