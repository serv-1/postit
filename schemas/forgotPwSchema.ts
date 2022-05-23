import emailSchema from './emailSchema'
import object from './object'

export interface ForgotPwSchema {
  email: string
}

const forgotPwSchema = object<ForgotPwSchema>({ email: emailSchema.required() })

export default forgotPwSchema
