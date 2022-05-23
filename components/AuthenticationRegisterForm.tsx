import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import PasswordStrength from './PasswordStrength'
import PasswordInput from './PasswordInput'
import Button from './Button'
import addUserSchema, { AddUserSchema } from '../schemas/addUserSchema'

const AuthenticationRegisterForm = () => {
  const methods = useForm<AddUserSchema>({
    resolver: joiResolver(addUserSchema),
  })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<AddUserSchema> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/user', data)

      await signIn('email', {
        email: data.email,
        callbackUrl: 'http://localhost:3000/profile',
        redirect: false,
      })

      const res = await signIn<'credentials'>('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (res && res.error) {
        return setToast({
          message:
            'Your account has been successfully created. You can now sign in!',
        })
      }

      router.push('/profile')
    } catch (e) {
      type FieldsNames = keyof AddUserSchema
      const { name, message } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <Form
      name="register"
      method="post"
      methods={methods}
      submitHandler={submitHandler}
    >
      <div className="mb-16">
        <label htmlFor="name">Name</label>
        <Input<AddUserSchema>
          type="text"
          name="name"
          needFocus
          bgColor="md:bg-fuchsia-100"
        />
        <InputError<AddUserSchema> inputName="name" />
      </div>

      <div className="mb-16">
        <label htmlFor="email">Email</label>
        <Input<AddUserSchema>
          type="email"
          name="email"
          bgColor="md:bg-fuchsia-100"
        />
        <InputError<AddUserSchema> inputName="email" />
      </div>

      <div className="mb-16">
        <label htmlFor="password" className="inline-block w-1/2">
          Password
        </label>
        <PasswordStrength className="inline-block w-1/2 text-right">
          {(onChange) => (
            <PasswordInput<AddUserSchema>
              onChange={onChange}
              bgColor="bg-fuchsia-50 md:bg-fuchsia-100"
            />
          )}
        </PasswordStrength>
        <InputError<AddUserSchema> inputName="password" />
      </div>

      <div className="flex justify-end">
        <Button color="primary">Register</Button>
      </div>
    </Form>
  )
}

export default AuthenticationRegisterForm
