import Joi from 'joi'
import object from './object'
import { nameSchema } from './nameSchema'
import { emailSchema } from './emailSchema'
import { passwordSchema } from './passwordSchema'

export interface RegisterSchema {
  name: string
  email: string
  password: string
}

export const registerSchema = object<RegisterSchema>({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema.invalid(Joi.ref('email'), Joi.ref('name')),
})
