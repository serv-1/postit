import { emailSchema } from './emailSchema'
import object from './object'

export interface ForgotPasswordSchema {
  email: string
}

export const forgotPasswordSchema = object<ForgotPasswordSchema>({
  email: emailSchema,
})
