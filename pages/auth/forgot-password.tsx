import axios, { AxiosError } from 'axios'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Send from '../../public/static/images/send.svg'
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
        <title>Filanad - Forgot password</title>
      </Head>
      <main className="w-25 my-4 m-auto shadow rounded">
        <h1 className="bg-primary text-light rounded-top p-2 m-0">
          Sign in with your email
        </h1>
        <p className="m-0 pt-2 ps-2">
          We will send you an email with a link that will sign you. Once signed,
          you will be able to change your password.
        </p>
        <Form
          name="sendMail"
          method="post"
          submitHandlers={{ submitHandler }}
          methods={methods}
          className="text-end"
        >
          <FormField
            labelText="Email"
            inputName="email"
            type="email"
            needFocus
          />
          <Button type="submit" className="btn-primary">
            <Send /> Send
          </Button>
        </Form>
      </main>
    </>
  )
}

export default ForgotPassword
