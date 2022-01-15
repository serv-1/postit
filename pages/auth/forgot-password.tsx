import axios, { AxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
import Head from 'next/head'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { emailSchema } from '../../utils/joiSchemas'
import Send from '../../public/static/images/send.svg'
import err from '../../utils/errors'
import Form from '../../components/Form'
import FormTextField from '../../components/FormTextField'
import Button from '../../components/Button'

interface FormFields {
  email: string
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      csrfToken: await getCsrfToken(ctx),
    },
  }
}

interface ForgotPasswordProps {
  csrfToken?: string
}

const ForgotPassword = ({ csrfToken }: ForgotPasswordProps) => {
  const [serverError, setServerError] = useState<string>()
  const methods = useForm<FormFields>({ resolver: joiResolver(emailSchema) })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/verifyEmail', data)
      await signIn('email', {
        email: data.email,
        callbackUrl: 'http://localhost:3000/profile',
      })
    } catch (e) {
      const res = (e as AxiosError).response
      if (!res) return setServerError(err.NO_RESPONSE)
      const { message } = res.data
      if (res.status === 422) {
        return methods.setError('email', { message }, { shouldFocus: true })
      }
      setServerError(message)
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
          We will send you an email with a link that will log you. Once logged,
          you will be able to change your password.
        </p>
        {serverError && (
          <div className="fw-bold p-2 pb-0 text-danger" role="alert">
            {serverError}
          </div>
        )}
        <Form
          name="sendMail"
          method="post"
          submitHandlers={{ submitHandler }}
          methods={methods}
          csrfToken={csrfToken}
        >
          <FormTextField
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
