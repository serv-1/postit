import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { registerSchema, RegisterSchema } from '../lib/joi/registerSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import PasswordField from './PasswordField'

const AuthenticationRegisterForm = () => {
  const methods = useForm<RegisterSchema>({
    resolver: joiResolver(registerSchema),
  })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<RegisterSchema> = async (data) => {
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
        return router.push('/auth/sign-in')
      }

      router.push('/profile')
    } catch (e) {
      type FieldsNames = keyof RegisterSchema
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
        <Input<RegisterSchema>
          type="text"
          name="name"
          needFocus
          className="md:bg-fuchsia-100"
        />
        <InputError<RegisterSchema> inputName="name" />
      </div>

      <div className="mb-16">
        <label htmlFor="email">Email</label>
        <Input<RegisterSchema>
          type="email"
          name="email"
          className="md:bg-fuchsia-100"
        />
        <InputError<RegisterSchema> inputName="email" />
      </div>

      <PasswordField<RegisterSchema>
        showStrength
        inputClass="md:bg-fuchsia-100"
        containerClass="md:bg-fuchsia-100"
      />

      <Button type="submit" className="relative left-full -translate-x-full">
        Register
      </Button>
    </Form>
  )
}

export default AuthenticationRegisterForm
