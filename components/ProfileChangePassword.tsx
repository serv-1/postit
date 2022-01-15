import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { ValidationError } from 'joi'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import err from '../utils/errors'
import { passwordSchema } from '../utils/joiSchemas'
import Form from './Form'
import InputError from './InputError'
import Label from './Label'
import PasswordInput from './PasswordInput'

interface FormFields {
  password: string
}

const ProfileChangePassword = () => {
  const { data } = useSession()
  const { id } = (data as Session).user
  const { setToast } = useToast()
  const methods = useForm<FormFields>({ resolver: joiResolver(passwordSchema) })

  const setError = (message: string) =>
    methods.setError('password', { message }, { shouldFocus: true })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.put(`http://localhost:3000/api/users/:${id}`, data)

      setToast({
        message: 'Your password has been updated! 🎉',
        background: 'success',
      })
    } catch (e) {
      if (e instanceof ValidationError) return setError(e.details[0].message)

      const res = (e as AxiosError).response

      if (!res) return setError(err.NO_RESPONSE)

      setError(res.data.message || err.DEFAULT_SERVER_ERROR)
    }
  }

  return (
    <div className="container my-4">
      <Form
        name="updateUserPassword"
        method="post"
        submitHandlers={{ submitHandler }}
        methods={methods}
        className="w-50 m-auto p-2 rounded border border-1"
      >
        <Label htmlFor="password" labelText="Change your password" />
        <div className="input-group">
          <PasswordInput showStrength />
          <InputError inputName="password" />
          <input className="btn btn-primary" type="submit" value="Change" />
        </div>
      </Form>
    </div>
  )
}

export default ProfileChangePassword
