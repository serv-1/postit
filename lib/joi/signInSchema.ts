import { emailSchema } from './emailSchema'
import object from './object'
import { passwordSchema } from './passwordSchema'

const signInSchema = object({
  email: emailSchema,
  password: passwordSchema,
})

export default signInSchema
