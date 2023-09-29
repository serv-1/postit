import discussionMessage from 'schemas/discussionMessage'
import createObjectSchema from 'functions/createObjectSchema'
import { MESSAGE_REQUIRED } from 'constants/errors'

export interface UpdateDiscussion {
  message: string
}

const updateDiscussion = createObjectSchema<UpdateDiscussion>({
  message: discussionMessage.required().messages({
    'any.required': MESSAGE_REQUIRED,
  }),
})

export default updateDiscussion
