import axios, { AxiosError } from 'axios'
import { GetServerSideProps } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
import Head from 'next/head'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import TextInput from '../../components/TextInput'
import { emailSchema } from '../../utils/joiSchemas'
import Send from '../../public/static/images/send.svg'
import err from '../../utils/errors'

type FormFields = { email: string }

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      csrfToken: await getCsrfToken(ctx),
    },
  }
}

const ForgotPassword = ({ csrfToken }: { csrfToken?: string }) => {
  const [serverError, setServerError] = useState<string>()
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitted },
    setFocus,
    setError,
  } = useForm<FormFields>({ resolver: joiResolver(emailSchema) })

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
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
        return setError('email', { message }, { shouldFocus: true })
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
        <form
          name="sendEmail"
          id="sendEmail"
          method="post"
          action=""
          encType="application/json"
          noValidate
          className="p-2 text-end"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input type="hidden" value={csrfToken} name="csrfToken" />
          <TextInput
            email
            name="email"
            labelName="Email"
            setFocus={setFocus}
            register={register}
            error={errors.email}
            isFormSubmitted={isSubmitted}
          />
          <button type="submit" className="btn btn-primary">
            <Send /> Send
          </button>
        </form>
      </main>
    </>
  )
}

export default ForgotPassword
