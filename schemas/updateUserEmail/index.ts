import userEmail from 'schemas/userEmail'
import createObjectSchema from 'functions/createObjectSchema'
import { EMAIL_REQUIRED } from 'constants/errors'

export interface UpdateUserEmail {
  email: string
}

const updateUserEmail = createObjectSchema<UpdateUserEmail>({
  email: userEmail.required().messages({ 'any.required': EMAIL_REQUIRED }),
})

export default updateUserEmail
