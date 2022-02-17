import { emailSchema } from './emailSchema'
import object from './object'
import { passwordSchema } from './passwordSchema'

export interface SignInSchema {
  email: string
  password: string
}

export const signInSchema = object<SignInSchema>({
  email: emailSchema,
  password: passwordSchema,
})
