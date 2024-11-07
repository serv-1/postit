import userEmail from 'schemas/userEmail'
import createObjectSchema from 'functions/createObjectSchema'
import { EMAIL_REQUIRED } from 'constants/errors'

export interface SendResetPasswordLink {
  email: string
}

const sendResetPasswordLink = createObjectSchema<SendResetPasswordLink>({
  email: userEmail.required().messages({ 'any.required': EMAIL_REQUIRED }),
})

export default sendResetPasswordLink
