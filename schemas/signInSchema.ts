import emailSchema from './emailSchema'
import object from './object'
import passwordSchema from './passwordSchema'

export interface SignInSchema {
  email: string
  password: string
}

const signInSchema = object<SignInSchema>({
  email: emailSchema.required(),
  password: passwordSchema.required(),
})

export default signInSchema
