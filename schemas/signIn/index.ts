import userEmail from 'schemas/userEmail'
import userPassword from 'schemas/userPassword'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface SignIn {
  email: string
  password: string
}

const signIn = createObjectSchema<SignIn>({
  email: userEmail.required().messages({ 'any.required': err.EMAIL_REQUIRED }),
  password: userPassword
    .required()
    .messages({ 'any.required': err.PASSWORD_REQUIRED }),
})

export default signIn
