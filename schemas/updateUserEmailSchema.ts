import csrfTokenSchema from './csrfTokenSchema'
import emailSchema from './emailSchema'
import object from './object'

export interface UpdateUserEmailSchema {
  email: string
  csrfToken: string
}

const updateUserEmailSchema = object<UpdateUserEmailSchema>({
  email: emailSchema.required(),
  csrfToken: csrfTokenSchema,
})

export default updateUserEmailSchema
