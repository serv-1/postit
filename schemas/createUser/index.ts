import Joi from 'joi'
import userEmail from 'schemas/userEmail'
import name from 'schemas/name'
import userPassword from 'schemas/userPassword'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface CreateUser {
  name: string
  email: string
  password: string
}

const createUser = createObjectSchema<CreateUser>({
  name: name.required().messages({ 'any.required': err.NAME_REQUIRED }),
  email: userEmail.required().messages({ 'any.required': err.EMAIL_REQUIRED }),
  password: userPassword
    .required()
    .invalid(Joi.ref('email'), Joi.ref('name'))
    .messages({
      'any.required': err.PASSWORD_REQUIRED,
      'any.invalid': err.PASSWORD_SAME,
    }),
})

export default createUser
