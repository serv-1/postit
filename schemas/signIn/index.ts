import userEmail from 'schemas/userEmail'
import userPassword from 'schemas/userPassword'
import createObjectSchema from 'functions/createObjectSchema'
import { EMAIL_REQUIRED, PASSWORD_REQUIRED } from 'constants/errors'

export interface SignIn {
  email: string
  password: string
}

const signIn = createObjectSchema<SignIn>({
  email: userEmail.required().messages({ 'any.required': EMAIL_REQUIRED }),
  password: userPassword
    .required()
    .messages({ 'any.required': PASSWORD_REQUIRED }),
})

export default signIn
