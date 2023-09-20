import { joiResolver } from '@hookform/resolvers/joi'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from 'contexts/toast'
import updateUserEmailSchema, {
  type UpdateUserEmailSchema,
} from 'schemas/updateUserEmailSchema'
import updateUserNameSchema, {
  type UpdateUserNameSchema,
} from 'schemas/updateUserNameSchema'
import updateUserPwSchema, {
  type UpdateUserPwSchema,
} from 'schemas/updateUserPwSchema'
import Button from 'components/Button'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PasswordInput from 'components/PasswordInput'
import PasswordStrength from 'components/PasswordStrength'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'

interface UpdateAccountFormProps {
  value: 'name' | 'email' | 'password'
  setName?: React.Dispatch<React.SetStateAction<string>>
}

type Schemas =
  | typeof updateUserNameSchema
  | typeof updateUserEmailSchema
  | typeof updateUserPwSchema

type TSchemas =
  | UpdateUserNameSchema
  | UpdateUserEmailSchema
  | UpdateUserPwSchema

export default function UpdateAccountForm({
  value,
  setName,
}: UpdateAccountFormProps) {
  let schema: Schemas = updateUserNameSchema

  if (value === 'email') {
    schema = updateUserEmailSchema
  } else if (value === 'password') {
    schema = updateUserPwSchema
  }

  const methods = useForm<TSchemas>({ resolver: joiResolver(schema) })
  const { setToast } = useToast()

  const submitHandler: SubmitHandler<TSchemas> = async (data) => {
    const response = await ajax.put('/user', data, { csrf: true })

    if (!response.ok) {
      const data: UserPutError = await response.json()

      methods.setError(value, data, { shouldFocus: true })

      return
    }

    setToast({ message: `Your ${value} has been updated! 🎉` })

    if (setName) {
      setName(data[value] as string)
    }
  }

  return (
    <Form methods={methods} submitHandler={submitHandler}>
      {value === 'password' ? (
        <div className="mb-16">
          <div className="flex flex-row flex-nowrap items-end md:mb-32">
            <div className="w-full flex flex-row flex-wrap">
              <label htmlFor="password" className="w-1/2">
                Password
              </label>
              <PasswordStrength className="w-1/2 text-right">
                {(onChange) => (
                  <PasswordInput<UpdateUserPwSchema>
                    onChange={onChange}
                    noRightRadius
                    bgColor="bg-fuchsia-100"
                  />
                )}
              </PasswordStrength>
            </div>
            <Button color="primary" noRadius="left">
              Change
            </Button>
          </div>
          <InputError<UpdateUserPwSchema> inputName="password" />
        </div>
      ) : (
        <div className="mb-16 md:mb-32">
          <label htmlFor={value}>
            {value[0].toUpperCase() + value.slice(1)}
          </label>
          <div className="flex flex-row flex-nowrap">
            <Input<UpdateUserEmailSchema | UpdateUserNameSchema>
              type={value === 'name' ? 'text' : value}
              name={value}
              noRightRadius
              bgColor="bg-fuchsia-100"
            />
            <InputError<UpdateUserEmailSchema | UpdateUserNameSchema>
              inputName={value}
            />
            <Button color="primary" noRadius="left">
              Change
            </Button>
          </div>
        </div>
      )}
    </Form>
  )
}
