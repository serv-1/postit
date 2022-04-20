import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { signIn } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
} from '../lib/joi/forgotPasswordSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import { useToast } from '../contexts/toast'

const AuthenticationForgotPassword = () => {
  const methods = useForm<ForgotPasswordSchema>({
    resolver: joiResolver(forgotPasswordSchema),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<ForgotPasswordSchema> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/verifyEmail', data)
      await signIn('email', {
        email: data.email,
        callbackUrl: 'http://localhost:3000/profile',
      })
    } catch (e) {
      const { message, status } = getAxiosError(e as AxiosError)

      if (status !== 422) {
        return setToast({ message, error: true })
      }

      methods.setError('email', { message }, { shouldFocus: true })
    }
  }

  return (
    <>
      <h1>Forgot password</h1>
      <p className="mt-16 mb-32">
        A mail will be sent to your email with a link to connect to your
        account. Once signed in, you will be able to change your password.
      </p>
      <Form
        name="sendMail"
        method="post"
        methods={methods}
        submitHandler={submitHandler}
      >
        <div className="mb-16">
          <label htmlFor="email">Email</label>
          <Input<ForgotPasswordSchema>
            type="email"
            name="email"
            needFocus
            className="md:bg-fuchsia-100"
          />
          <InputError<ForgotPasswordSchema> inputName="email" />
        </div>
        <Button type="submit" className="relative left-full -translate-x-full">
          Send
        </Button>
      </Form>
      <div className="flex-grow flex items-end">
        <a
          href={'/authentication#sign-in'}
          className="hover:underline text-fuchsia-600"
          onClick={(e) => {
            e.preventDefault()
            window.location.hash = 'sign-in'
            window.dispatchEvent(new CustomEvent('onHashChange'))
          }}
        >
          ← Back to Authentication
        </a>
      </div>
    </>
  )
}

export default AuthenticationForgotPassword
