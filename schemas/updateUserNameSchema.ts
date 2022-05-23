import csrfTokenSchema from './csrfTokenSchema'
import nameSchema from './nameSchema'
import object from './object'

export interface UpdateUserNameSchema {
  name: string
  csrfToken: string
}

const updateUserNameSchema = object<UpdateUserNameSchema>({
  name: nameSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default updateUserNameSchema
