import emailSchema from './emailSchema'
import object from './object'

export interface UpdateUserEmailSchema {
  email: string
  name?: never
  password?: never
}

const updateUserEmailSchema = object<UpdateUserEmailSchema>({
  email: emailSchema.required(),
})

export default updateUserEmailSchema
