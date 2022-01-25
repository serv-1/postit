import Joi from 'joi'
import object from './object'
import { nameSchema } from './nameSchema'
import { emailSchema } from './emailSchema'
import { passwordSchema } from './passwordSchema'

const registerSchema = object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema.invalid(Joi.ref('email'), Joi.ref('name')),
})

export default registerSchema
