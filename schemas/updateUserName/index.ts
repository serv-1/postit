import name from 'schemas/name'
import createObjectSchema from 'functions/createObjectSchema'
import { NAME_REQUIRED } from 'constants/errors'

export interface UpdateUserName {
  name: string
}

const updateUserName = createObjectSchema<UpdateUserName>({
  name: name.required().messages({ 'any.required': NAME_REQUIRED }),
})

export default updateUserName
