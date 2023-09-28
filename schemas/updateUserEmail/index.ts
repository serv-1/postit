import userEmail from 'schemas/userEmail'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface UpdateUserEmail {
  email: string
  name?: never
  password?: never
}

const updateUserEmail = createObjectSchema<UpdateUserEmail>({
  email: userEmail.required().messages({ 'any.required': err.EMAIL_REQUIRED }),
})

export default updateUserEmail
