import { joiResolver } from '@hookform/resolvers/joi'
import axios from 'axios'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { passwordCsrfSchema } from '../utils/joiSchemas'
import Form from './Form'
import InputError from './InputError'
import Label from './Label'
import PasswordInput from './PasswordInput'
import getApiError from '../utils/getApiError'

interface FormFields {
  csrfToken?: string
  password: string
}

const ProfileChangePassword = () => {
  const { data } = useSession()
  const { id } = (data as Session).user
  const { setToast } = useToast()
  const methods = useForm<FormFields>({
    resolver: joiResolver(passwordCsrfSchema),
  })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.put(`http://localhost:3000/api/users/${id}`, data)

      setToast({
        message: 'Your password has been updated! 🎉',
        background: 'success',
      })
    } catch (e) {
      const { message } = getApiError(e)
      methods.setError('password', { message }, { shouldFocus: true })
    }
  }

  return (
    <div className="my-4">
      <Form
        name="updateUserPassword"
        method="post"
        submitHandlers={{ submitHandler }}
        methods={methods}
        className="p-2 rounded border border-1"
        needCsrfToken
      >
        <Label htmlFor="password" labelText="Change your password" />
        <div className="input-group">
          <PasswordInput showStrength />
          <input
            className="btn btn-primary rounded"
            type="submit"
            value="Change"
          />
          <InputError inputName="password" />
        </div>
      </Form>
    </div>
  )
}

export default ProfileChangePassword
