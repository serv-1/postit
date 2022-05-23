import Joi from 'joi'
import emailSchema from './emailSchema'
import nameSchema from './nameSchema'
import object from './object'
import passwordSchema from './passwordSchema'

export interface AddUserSchema {
  name: string
  email: string
  password: string
}

const addUserSchema = object<AddUserSchema>({
  name: nameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema
    .required()
    .invalid(Joi.ref('email'), Joi.ref('name')),
})

export default addUserSchema
