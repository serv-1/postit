import Joi from 'joi'
import { IImage } from '../types/common'
import err from '../utils/constants/errors'
import csrfTokenSchema from './csrfTokenSchema'
import emailSchema from './emailSchema'
import idSchema from './idSchema'
import imageSchema from './imageSchema'
import nameSchema from './nameSchema'
import object from './object'
import passwordSchema from './passwordSchema'

export type UpdateUserApiSchema =
  | { csrfToken: string; name: string }
  | { csrfToken: string; email: string }
  | { csrfToken: string; password: string }
  | { csrfToken: string; image: IImage }
  | { csrfToken: string; favPostId: string; action: 'push' | 'pull' }

const updateUserApiSchema = object<UpdateUserApiSchema>({
  csrfToken: csrfTokenSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  image: imageSchema,
  favPostId: idSchema,
  action: Joi.string()
    .valid('push', 'pull')
    .messages({ 'string.base': err.ID_INVALID, 'any.only': err.ID_INVALID }),
})
  .xor('name', 'email', 'password', 'image', 'favPostId')
  .and('favPostId', 'action')
  .messages({ 'object.xor': err.DATA_INVALID, 'object.and': err.DATA_INVALID })

export default updateUserApiSchema
