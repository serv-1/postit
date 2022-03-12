import { IImage } from '../../types/common'
import err from '../../utils/constants/errors'
import { csrfTokenSchema } from './csrfTokenSchema'
import { emailSchema } from './emailSchema'
import { imageSchema } from './imageSchema'
import { nameSchema } from './nameSchema'
import object from './object'
import { passwordSchema } from './passwordSchema'

export type UsersIdPutSchema =
  | { csrfToken: string; name: string }
  | { csrfToken: string; email: string }
  | { csrfToken: string; password: string }
  | { csrfToken: string; image: IImage }

export const usersIdPutSchema = object<UsersIdPutSchema>({
  csrfToken: csrfTokenSchema,
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  image: imageSchema.optional(),
})
  .xor('name', 'email', 'password', 'image')
  .messages({ 'object.xor': err.DATA_INVALID })
