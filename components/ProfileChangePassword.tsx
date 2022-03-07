import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { passwordCsrfSchema } from '../lib/joi/passwordSchema'
import Form from './Form'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import FormPasswordField from './FormPasswordField'

interface FormFields {
  csrfToken?: string
  password: string
}

const ProfileChangePassword = () => {
  const { setToast } = useToast()

  const resolver = joiResolver(passwordCsrfSchema)
  const methods = useForm<FormFields>({ resolver })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.put('http://localhost:3000/api/user', data)

      setToast({
        message: 'Your password has been updated! 🎉',
        background: 'success',
      })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      methods.setError('password', { message }, { shouldFocus: true })
    }
  }

  return (
    <Form
      name="updateUserPassword"
      method="post"
      submitHandlers={{ submitHandler }}
      methods={methods}
      needCsrfToken
    >
      <FormPasswordField showStrength labelText="New password" />
      <div className="md:text-right">
        <Button type="submit" className="w-full md:w-auto">
          Change
        </Button>
      </div>
    </Form>
  )
}

export default ProfileChangePassword
