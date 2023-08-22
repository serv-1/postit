import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from 'contexts/toast'
import updateUserEmailSchema, {
  UpdateUserEmailSchema,
} from 'schemas/updateUserEmailSchema'
import updateUserNameSchema, {
  UpdateUserNameSchema,
} from 'schemas/updateUserNameSchema'
import updateUserPwSchema, {
  UpdateUserPwSchema,
} from 'schemas/updateUserPwSchema'
import getAxiosError from 'utils/functions/getAxiosError'
import Button from './Button'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import PasswordInput from './PasswordInput'
import PasswordStrength from './PasswordStrength'

interface UpdateAccountFormProps {
  value: 'name' | 'email' | 'password'
  setName?: React.Dispatch<React.SetStateAction<string>>
  csrfToken?: string
}

type Schemas =
  | typeof updateUserNameSchema
  | typeof updateUserEmailSchema
  | typeof updateUserPwSchema

type TSchemas =
  | UpdateUserNameSchema
  | UpdateUserEmailSchema
  | UpdateUserPwSchema

const UpdateAccountForm = (props: UpdateAccountFormProps) => {
  const { value, setName, csrfToken } = props
  let schema: Schemas = updateUserNameSchema

  if (value === 'email') {
    schema = updateUserEmailSchema
  } else if (value === 'password') {
    schema = updateUserPwSchema
  }

  const methods = useForm<TSchemas>({ resolver: joiResolver(schema) })
  const { setToast } = useToast()

  const submitHandler: SubmitHandler<TSchemas> = async (data) => {
    try {
      await axios.put('/api/user', data)
      setToast({ message: `Your ${value} has been updated! 🎉` })
      if (setName) setName(data[value] as string)
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      methods.setError(value, { message }, { shouldFocus: true })
    }
  }

  return (
    <Form methods={methods} submitHandler={submitHandler} csrfToken={csrfToken}>
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

export default UpdateAccountForm
