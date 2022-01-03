import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useRouter } from 'next/router'
import TextInput from '../components/TextInput'
import PasswordInput from '../components/PasswordInput'
import { useState } from 'react'
import { registerSchema } from '../utils/joiSchemas'
import { signIn } from 'next-auth/react'

type FormFields = {
  name: string
  email: string
  password: string
}

const Register = () => {
  const [serverError, setServerError] = useState<string>()
  const [nameValue, setNameValue] = useState<string>()
  const [emailValue, setEmailValue] = useState<string>()
  const {
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
    setError,
    setFocus,
  } = useForm<FormFields>({ resolver: joiResolver(registerSchema) })
  const router = useRouter()

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/users', data)
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
      if (res && res.error) return router.push('/auth/sign-in')
      router.push('/profile')
    } catch (e) {
      const res = (e as AxiosError).response as AxiosResponse
      if (res.status === 422) {
        setError(
          res.data.name,
          { message: res.data.message },
          { shouldFocus: true }
        )
      } else {
        setServerError(res.data.message)
      }
    }
  }

  const userInputs: string[] = []

  if (nameValue) userInputs.push(nameValue)
  if (emailValue) userInputs.push(emailValue)

  return (
    <>
      <Head>
        <title>Filanad - Register</title>
      </Head>
      <main className="w-25 my-4 m-auto shadow rounded">
        <h1 className="bg-primary text-light rounded-top p-2 m-0">Register</h1>
        {serverError && (
          <div className="fw-bold p-2 pb-0 text-danger" role="alert">
            {serverError}
          </div>
        )}
        <form
          name="register"
          id="register"
          className="p-2 text-end"
          method="post"
          action=""
          encType="application/json"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextInput
            labelName="Name"
            name="name"
            isFormSubmitted={isSubmitted}
            error={errors.name}
            register={register}
            setFocus={setFocus}
            setValue={setNameValue}
          />
          <TextInput
            labelName="Email"
            email
            name="email"
            isFormSubmitted={isSubmitted}
            error={errors.email}
            register={register}
            setValue={setEmailValue}
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
            userInputs={userInputs}
          />
          <input type="submit" value="Register" className="btn btn-primary" />
        </form>
      </main>
    </>
  )
}

export default Register
