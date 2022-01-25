import { emailSchema } from './emailSchema'
import object from './object'

const forgotPasswordSchema = object({
  email: emailSchema,
})

export default forgotPasswordSchema
