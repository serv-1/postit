import { PASSWORD_REQUIRED } from 'constants/errors'
import createObjectSchema from 'functions/createObjectSchema'
import userPassword from 'schemas/userPassword'

export interface ResetPassword {
  password: string
}

const resetPassword = createObjectSchema<ResetPassword>({
  password: userPassword
    .required()
    .messages({ 'any.required': PASSWORD_REQUIRED }),
})

export default resetPassword
