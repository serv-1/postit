import discussionMessage from 'schemas/discussionMessage'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface UpdateDiscussion {
  message: string
}

const updateDiscussion = createObjectSchema<UpdateDiscussion>({
  message: discussionMessage.required().messages({
    'any.required': err.MESSAGE_REQUIRED,
  }),
})

export default updateDiscussion
