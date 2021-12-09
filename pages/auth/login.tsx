import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
// commonJS needed https://github.com/react-hook-form/resolvers/issues/271
const { joiResolver } = require('@hookform/resolvers/joi')
import { SubmitHandler, useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { loginSchema } from '../../utils/joiSchemas'
import TextInput from '../../components/TextInput'
import PasswordInput from '../../components/PasswordInput'

type FormInput = {
  csrfToken: string
  email: string
  password: string
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      csrfToken: await getCsrfToken(ctx),
    },
  }
}

const Login = ({ csrfToken }: { csrfToken: string | null }) => {
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormInput>({
    resolver: joiResolver(loginSchema),
  })
  const router = useRouter()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    const res = await signIn<'credentials'>('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (res && res.error) {
      setError(res.error)
      return
    }
    router.push('/profile')
  }

  return (
    <>
      <Head>
        <title>Filanad - Log in!</title>
      </Head>
      <h1 className="bg-primary text-light rounded-top p-2 m-0">Log in!</h1>
      {error && (
        <div
          className="fw-bold p-2 pb-0 text-danger"
          id="globalFeedback"
          role="alert"
        >
          {error}
        </div>
      )}
      <form
        name="login"
        id="login"
        method="get"
        action=""
        encType="application/json"
        noValidate
        className="p-2 text-end"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="hidden"
          name="csrfToken"
          defaultValue={csrfToken || undefined}
        />
        <TextInput
          email
          name="email"
          labelName="Email"
          register={register}
          error={errors.email}
          isFormSubmitted={isSubmitted}
        />
        <PasswordInput
          name="password"
          register={register}
          labelName="Password"
          error={errors.password}
          isFormSubmitted={isSubmitted}
        />
        <input type="submit" value="Log in" className="btn btn-primary" />
      </form>
    </>
  )
}

export default Login
