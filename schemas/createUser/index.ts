import Joi from 'joi'
import userEmail from 'schemas/userEmail'
import name from 'schemas/name'
import userPassword from 'schemas/userPassword'
import createObjectSchema from 'functions/createObjectSchema'
import {
  NAME_REQUIRED,
  EMAIL_REQUIRED,
  PASSWORD_REQUIRED,
  PASSWORD_SAME,
} from 'constants/errors'

export interface CreateUser {
  name: string
  email: string
  password: string
}

const createUser = createObjectSchema<CreateUser>({
  name: name.required().messages({ 'any.required': NAME_REQUIRED }),
  email: userEmail.required().messages({ 'any.required': EMAIL_REQUIRED }),
  password: userPassword
    .required()
    .invalid(Joi.ref('email'), Joi.ref('name'))
    .messages({
      'any.required': PASSWORD_REQUIRED,
      'any.invalid': PASSWORD_SAME,
    }),
})

export default createUser
