import Joi from 'joi'
import { IImage } from '../../types/common'
import err from '../../utils/constants/errors'
import { csrfTokenSchema } from './csrfTokenSchema'
import { emailSchema } from './emailSchema'
import { idSchema } from './idSchema'
import { imageSchema } from './imageSchema'
import { nameSchema } from './nameSchema'
import object from './object'
import { passwordSchema } from './passwordSchema'

export type UserPutSchema =
  | { csrfToken: string; name: string }
  | { csrfToken: string; email: string }
  | { csrfToken: string; password: string }
  | { csrfToken: string; image: IImage }
  | { csrfToken: string; favPostId: string; action: 'push' | 'pull' }

export const userPutSchema = object<UserPutSchema>({
  csrfToken: csrfTokenSchema,
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  image: imageSchema.optional(),
  favPostId: idSchema.optional(),
  action: Joi.string()
    .valid('push', 'pull')
    .optional()
    .messages({ 'string.base': err.ID_INVALID, 'any.only': err.ID_INVALID }),
})
  .xor('name', 'email', 'password', 'image', 'favPostId')
  .and('favPostId', 'action')
  .messages({ 'object.xor': err.DATA_INVALID, 'object.and': err.DATA_INVALID })
