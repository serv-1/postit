import nameSchema from './nameSchema'
import object from './object'

export interface UpdateUserNameSchema {
  name: string
  email?: never
  password?: never
}

const updateUserNameSchema = object<UpdateUserNameSchema>({
  name: nameSchema.required(),
})

export default updateUserNameSchema
