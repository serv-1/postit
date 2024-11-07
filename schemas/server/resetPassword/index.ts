import {
  ID_REQUIRED,
  PASSWORD_REQUIRED,
  TOKEN_REQUIRED,
} from 'constants/errors'
import createObjectSchema from 'functions/createObjectSchema'
import token from 'schemas/token'
import userPassword from 'schemas/userPassword'
import id from '../id'

export interface ResetPassword {
  password: string
  token: string
  userId: string
}

const resetPassword = createObjectSchema<ResetPassword>({
  password: userPassword
    .required()
    .messages({ 'any.required': PASSWORD_REQUIRED }),
  token: token.required().messages({ 'any.required': TOKEN_REQUIRED }),
  userId: id.required().messages({ 'any.required': ID_REQUIRED }),
})

export default resetPassword
