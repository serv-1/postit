import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
// commonJS needed https://github.com/react-hook-form/resolvers/issues/271
const { joiResolver } = require('@hookform/resolvers/joi')
import { SubmitHandler, useForm } from 'react-hook-form'
import Joi from 'joi'
import { useState } from 'react'
import { useRouter } from 'next/router'

type FormInput = {
  csrfToken: string
  email: string
  password: string
}

const schema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      'string.base': 'The email is not valid.',
      'string.empty': 'The email cannot be empty.',
      'string.email': 'The email is not valid.',
      'any.required': 'The email is required.',
    }),
  password: Joi.string().required().messages({
    'string.base': 'The password is not valid.',
    'string.empty': 'The password cannot be empty.',
    'any.required': 'The password is required.',
  }),
})

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
    resolver: joiResolver(schema),
  })
  const router = useRouter()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    const response = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (!response) return
    if (response.error) {
      setError(response.error)
    } else {
      router.push('/')
    }
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
        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`form-control ${
              isSubmitted && (errors.email ? 'is-invalid' : 'is-valid')
            }`}
            aria-describedby="emailFeedback globalFeedback"
          />
          {errors.email && (
            <div className="invalid-feedback" id="emailFeedback" role="alert">
              {errors.email.message}
            </div>
          )}
        </div>
        <div className="mb-3 text-start">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className={`form-control ${
              isSubmitted && (errors.password ? 'is-invalid' : 'is-valid')
            }`}
            aria-describedby="passwordFeedback globalFeedback"
          />
          {errors.password && (
            <div
              className="invalid-feedback"
              id="passwordFeedback"
              role="alert"
            >
              {errors.password.message}
            </div>
          )}
        </div>
        <input type="submit" value="Log in" className="btn btn-primary" />
      </form>
    </>
  )
}

export default Login
