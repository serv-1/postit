import userPassword from 'schemas/userPassword'
import createObjectSchema from 'functions/createObjectSchema'
import { PASSWORD_REQUIRED } from 'constants/errors'

export interface UpdateUserPassword {
  password: string
  email?: never
  name?: never
}

const updateUserPassword = createObjectSchema<UpdateUserPassword>({
  password: userPassword
    .required()
    .messages({ 'any.required': PASSWORD_REQUIRED }),
})

export default updateUserPassword
