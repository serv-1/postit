import axios, { AxiosError } from 'axios'
import { useToast } from '../contexts/toast'
import {
  PasswordCsrfSchema,
  passwordCsrfSchema,
} from '../lib/joi/passwordSchema'
import Form from './Form'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import PasswordInput from './PasswordInput'
import InputError from './InputError'

const ProfileChangePassword = () => {
  const methods = useForm<PasswordCsrfSchema>({
    resolver: joiResolver(passwordCsrfSchema),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<PasswordCsrfSchema> = async (data) => {
    try {
      await axios.put('http://localhost:3000/api/user', data)
      setToast({ message: 'Your password has been updated! 🎉' })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      methods.setError('password', { message }, { shouldFocus: true })
    }
  }

  return (
    <Form
      name="updateUserPassword"
      method="post"
      methods={methods}
      submitHandler={submitHandler}
      needCsrfToken
    >
      <div className="mb-16">
        <label htmlFor="password">New password</label>
        <PasswordInput<PasswordCsrfSchema> showStrength />
        <InputError<PasswordCsrfSchema> inputName="password" />
      </div>
      <div className="md:text-right">
        <Button type="submit" className="w-full md:w-auto">
          Change
        </Button>
      </div>
    </Form>
  )
}

export default ProfileChangePassword
