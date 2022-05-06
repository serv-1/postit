import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { EmailCsrfSchema, emailCsrfSchema } from '../lib/joi/emailSchema'
import { NameCsrfSchema, nameCsrfSchema } from '../lib/joi/nameSchema'
import {
  PasswordCsrfSchema,
  passwordCsrfSchema,
} from '../lib/joi/passwordSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import MainButton from './MainButton'
import PasswordInput from './PasswordInput'
import PasswordStrength from './PasswordStrength'

type Schemas = PasswordCsrfSchema | EmailCsrfSchema | NameCsrfSchema

interface UpdateAccountFormProps {
  value: 'name' | 'email' | 'password'
}

const UpdateAccountForm = ({ value }: UpdateAccountFormProps) => {
  const methods = useForm<Schemas>({
    resolver: joiResolver(
      value === 'password'
        ? passwordCsrfSchema
        : value === 'name'
        ? nameCsrfSchema
        : emailCsrfSchema
    ),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<Schemas> = async (data) => {
    try {
      await axios.put('http://localhost:3000/api/user', data)
      setToast({ message: `Your ${value} has been updated! 🎉` })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      methods.setError(value, { message }, { shouldFocus: true })
    }
  }

  return (
    <Form methods={methods} submitHandler={submitHandler} needCsrfToken>
      {value === 'password' ? (
        <div className="mb-16 flex flex-row flex-nowrap items-end md:mb-32">
          <div className="w-full flex flex-row flex-wrap">
            <label htmlFor="password" className="w-1/2">
              Password
            </label>
            <PasswordStrength className="w-1/2 text-right">
              {(onChange) => (
                <PasswordInput<PasswordCsrfSchema>
                  onChange={onChange}
                  containerClass="rounded-r-none bg-fuchsia-100 w-full"
                />
              )}
            </PasswordStrength>
            <InputError<PasswordCsrfSchema> inputName="password" />
          </div>
          <MainButton className="h-[42px] rounded-l-none">Change</MainButton>
        </div>
      ) : (
        <div className="mb-16 md:mb-32">
          <label htmlFor={value}>
            {value[0].toUpperCase() + value.slice(1)}
          </label>
          <div className="flex flex-row flex-nowrap">
            <Input<Schemas>
              type={value === 'name' ? 'text' : value}
              name={value}
              className="rounded-r-none bg-fuchsia-100"
            />
            <InputError<Schemas> inputName={value} />
            <MainButton className="rounded-l-none">Change</MainButton>
          </div>
        </div>
      )}
    </Form>
  )
}

export default UpdateAccountForm
