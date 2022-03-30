import axios, { AxiosError } from 'axios'
import { getSession, signIn } from 'next-auth/react'
import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Form from '../../components/Form'
import Button from '../../components/Button'
import getAxiosError from '../../utils/functions/getAxiosError'
import {
  ForgotPasswordSchema,
  forgotPasswordSchema,
} from '../../lib/joi/forgotPasswordSchema'
import Input from '../../components/Input'
import InputError from '../../components/InputError'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (session) {
    return { redirect: { permanent: false, destination: '/403' } }
  }

  return { props: {} }
}

const ForgotPassword = () => {
  const methods = useForm<ForgotPasswordSchema>({
    resolver: joiResolver(forgotPasswordSchema),
  })

  const submitHandler: SubmitHandler<ForgotPasswordSchema> = async (data) => {
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
          methods={methods}
          submitHandler={submitHandler}
          className="col-span-full"
        >
          <div className="mb-16">
            <label htmlFor="email">Email</label>
            <Input<ForgotPasswordSchema> type="email" name="email" needFocus />
            <InputError<ForgotPasswordSchema> inputName="email" />
          </div>

          <Button type="submit" className="w-full">
            Send
          </Button>
        </Form>
      </main>
    </>
  )
}

export default ForgotPassword
