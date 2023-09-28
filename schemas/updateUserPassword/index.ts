import userPassword from 'schemas/userPassword'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface UpdateUserPassword {
  password: string
  email?: never
  name?: never
}

const updateUserPassword = createObjectSchema<UpdateUserPassword>({
  password: userPassword
    .required()
    .messages({ 'any.required': err.PASSWORD_REQUIRED }),
})

export default updateUserPassword
