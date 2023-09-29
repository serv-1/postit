import userEmail from 'schemas/userEmail'
import createObjectSchema from 'functions/createObjectSchema'
import { EMAIL_REQUIRED } from 'constants/errors'

export interface ForgotPassword {
  email: string
}

const forgotPassword = createObjectSchema<ForgotPassword>({
  email: userEmail.required().messages({ 'any.required': EMAIL_REQUIRED }),
})

export default forgotPassword
