import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
// commonJS needed https://github.com/react-hook-form/resolvers/issues/271
const { joiResolver } = require('@hookform/resolvers/joi')
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import TextInput from '../components/TextInput'
import PasswordInput from '../components/PasswordInput'
import { useState } from 'react'
import { signupSchema } from '../utils/joiSchemas'

type FormInput = {
  username: string
  email: string
  password: string
}

type ServerError = {
  message: string
}

const Signup = () => {
  const [serverError, setServerError] = useState<ServerError>()
  const {
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
    setError,
  } = useForm<FormInput>({ resolver: joiResolver(signupSchema) })
  const router = useRouter()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/users', {
        username: data.username,
        email: data.email,
        password: data.password,
      })
      router.push('/')
    } catch (e) {
      const err = e as AxiosError
      if (!err.response) return
      if (err.response.status === 422) {
        setError(
          err.response.data.name,
          { message: err.response.data.message },
          { shouldFocus: true }
        )
      } else {
        setServerError(err.response.data.message)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Filanad - Sign up!</title>
      </Head>
      <h1 className="bg-primary text-light rounded-top p-2 m-0">Sign up!</h1>
      {serverError && (
        <div
          className="fw-bold p-2 m-2 text-light bg-danger rounded-3"
          role="alert"
        >
          {serverError}
        </div>
      )}
      <form
        name="signup"
        id="signup"
        className="p-2 text-end"
        method="post"
        action=""
        encType="application/json"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextInput
          labelName="Username"
          name="username"
          isFormSubmitted={isSubmitted}
          error={errors.username}
          register={register}
        />
        <TextInput
          labelName="Email"
          email
          name="email"
          isFormSubmitted={isSubmitted}
          error={errors.email}
          register={register}
        />
        <PasswordInput
          labelName="Password"
          rules
          showBtn
          strength
          name="password"
          isFormSubmitted={isSubmitted}
          error={errors.password}
          register={register}
        />
        <input type="submit" value="Sign up" className="btn btn-primary" />
      </form>
    </>
  )
}

export default Signup
