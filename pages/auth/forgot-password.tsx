import axios, { AxiosError } from 'axios'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Form from '../../components/Form'
import FormField from '../../components/FormField'
import Button from '../../components/Button'
import getAxiosError from '../../utils/functions/getAxiosError'
import { forgotPasswordSchema } from '../../lib/joi/forgotPasswordSchema'

interface FormFields {
  email: string
}

const ForgotPassword = () => {
  const methods = useForm<FormFields>({
    resolver: joiResolver(forgotPasswordSchema),
  })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/verifyEmail', data)
      await signIn('email', {
        email: data.email,
        callbackUrl: 'http://localhost:3000/profile',
      })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      methods.setError('email', { message }, { shouldFocus: true })
    }
  }

  return (
    <>
      <Head>
        <title>Forgot password - Filanad</title>
      </Head>
      <main className="py-32 grid grid-cols-4 gap-x-16 justify-center">
        <h1 className="text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16 col-span-full">
          Sign in with your email
        </h1>
        <p className="col-span-full mb-16">
          We will send you an email with a link that will sign you. Once signed,
          you will be able to change your password.
        </p>
        <Form
          name="sendMail"
          method="post"
          submitHandlers={{ submitHandler }}
          methods={methods}
          className="col-span-full"
        >
          <FormField
            labelText="Email"
            inputName="email"
            type="email"
            needFocus
          />
          <Button type="submit" className="w-full">
            Send
          </Button>
        </Form>
      </main>
    </>
  )
}

export default ForgotPassword
