import discussionMessage from 'schemas/discussionMessage'
import id from 'schemas/server/id'
import name from 'schemas/name'
import createObjectSchema from 'functions/createObjectSchema'
import { MESSAGE_REQUIRED, ID_INVALID, NAME_REQUIRED } from 'constants/errors'

export interface CreateDiscussion {
  message: string
  postId: string
  sellerId: string
  postName: string
}

const createDiscussion = createObjectSchema<CreateDiscussion>({
  message: discussionMessage
    .required()
    .messages({ 'any.required': MESSAGE_REQUIRED }),
  postId: id.required().messages({ 'any.required': ID_INVALID }),
  sellerId: id.required().messages({ 'any.required': ID_INVALID }),
  postName: name.required().messages({ 'any.required': NAME_REQUIRED }),
})

export default createDiscussion
