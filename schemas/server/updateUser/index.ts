import err from 'utils/constants/errors'
import userEmail from 'schemas/userEmail'
import id from 'schemas/server/id'
import imageKey from 'schemas/imageKey'
import name from 'schemas/name'
import userPassword from 'schemas/userPassword'
import createObjectSchema from 'utils/functions/createObjectSchema'

export type UpdateUser =
  | { name: string }
  | { email: string }
  | { password: string }
  | { image: string }
  | { favPostId: string }
  | { discussionId: string }

const updateUser = createObjectSchema<UpdateUser>({
  name: name,
  email: userEmail,
  password: userPassword,
  image: imageKey,
  favPostId: id,
  discussionId: id,
})
  .xor('name', 'email', 'password', 'image', 'favPostId', 'discussionId')
  .messages({
    'object.xor': err.DATA_INVALID,
    'object.missing': err.DATA_INVALID,
  })

export default updateUser
