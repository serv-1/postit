import csrfTokenSchema from './csrfTokenSchema'
import object from './object'
import passwordSchema from './passwordSchema'

export interface UpdateUserPwSchema {
  password: string
  csrfToken: string
}

const updateUserPwSchema = object<UpdateUserPwSchema>({
  password: passwordSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default updateUserPwSchema
