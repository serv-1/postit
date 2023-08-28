import object from './object'
import passwordSchema from './passwordSchema'

export interface UpdateUserPwSchema {
  password: string
  email?: never
  name?: never
}

const updateUserPwSchema = object<UpdateUserPwSchema>({
  password: passwordSchema.required(),
})

export default updateUserPwSchema
