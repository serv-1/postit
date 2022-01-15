import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { registerSchema } from '../utils/joiSchemas'
import { signIn } from 'next-auth/react'
import err from '../utils/errors'
import Form from '../components/Form'
import FormTextField from '../components/FormTextField'
import FormPasswordField from '../components/FormPasswordField'

interface FormFields {
  name: string
  email: string
  password: string
}

const Register = () => {
  const [serverError, setServerError] = useState<string>()
  const methods = useForm<FormFields>({ resolver: joiResolver(registerSchema) })
  const router = useRouter()

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/user', data)
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
      const res = (e as AxiosError).response
      if (!res) return setServerError(err.NO_RESPONSE)
      const { name, message } = res.data
      if (res.status === 422) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }
      setServerError(message || err.DEFAULT_SERVER_ERROR)
    }
  }

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
        <Form
          name="register"
          method="post"
          submitHandlers={{ submitHandler }}
          methods={methods}
          className="text-end"
        >
          <FormTextField
            labelText="Name"
            inputName="name"
            type="text"
            needFocus
          />
          <FormTextField labelText="Email" inputName="email" type="email" />
          <FormPasswordField showForgotPasswordLink showStrength showRules />
          <input type="submit" value="Register" className="btn btn-primary" />
        </Form>
      </main>
    </>
  )
}

export default Register
