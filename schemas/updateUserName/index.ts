import name from 'schemas/name'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface UpdateUserName {
  name: string
  email?: never
  password?: never
}

const updateUserName = createObjectSchema<UpdateUserName>({
  name: name.required().messages({ 'any.required': err.NAME_REQUIRED }),
})

export default updateUserName
