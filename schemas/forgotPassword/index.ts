import userEmail from 'schemas/userEmail'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface ForgotPassword {
  email: string
}

const forgotPassword = createObjectSchema<ForgotPassword>({
  email: userEmail.required().messages({ 'any.required': err.EMAIL_REQUIRED }),
})

export default forgotPassword
