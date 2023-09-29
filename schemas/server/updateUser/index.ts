import userEmail from 'schemas/userEmail'
import id from 'schemas/server/id'
import imageKey from 'schemas/imageKey'
import name from 'schemas/name'
import userPassword from 'schemas/userPassword'
import createObjectSchema from 'functions/createObjectSchema'
import { DATA_INVALID } from 'constants/errors'

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
    'object.xor': DATA_INVALID,
    'object.missing': DATA_INVALID,
  })

export default updateUser
