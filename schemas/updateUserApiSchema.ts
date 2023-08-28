import err from '../utils/constants/errors'
import emailSchema from './emailSchema'
import idSchema from './idSchema'
import keySchema from './keySchema'
import nameSchema from './nameSchema'
import object from './object'
import passwordSchema from './passwordSchema'

export type UpdateUserApiSchema =
  | { name: string }
  | { email: string }
  | { password: string }
  | { image: string }
  | { favPostId: string }
  | { discussionId: string }

const updateUserApiSchema = object<UpdateUserApiSchema>({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  image: keySchema,
  favPostId: idSchema,
  discussionId: idSchema,
})
  .xor('name', 'email', 'password', 'image', 'favPostId', 'discussionId')
  .messages({
    'object.xor': err.DATA_INVALID,
    'object.missing': err.DATA_INVALID,
  })

export default updateUserApiSchema
