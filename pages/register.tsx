import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import axios from 'axios'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import Form from '../components/Form'
import FormField from '../components/FormField'
import FormPasswordField from '../components/FormPasswordField'
import getApiError from '../utils/functions/getApiError'
import { useToast } from '../contexts/toast'
import registerSchema from '../lib/joi/registerSchema'

interface FormFields {
  name: string
  email: string
  password: string
}

const Register = () => {
  const methods = useForm<FormFields>({ resolver: joiResolver(registerSchema) })
  const { setToast } = useToast()
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
      const { name, message } = getApiError<'name' | 'email' | 'password'>(e)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, background: 'danger' })
    }
  }

  return (
    <>
      <Head>
        <title>Filanad - Register</title>
      </Head>
      <main className="w-25 my-4 m-auto shadow rounded">
        <h1 className="bg-primary text-light rounded-top p-2 m-0">Register</h1>
        <Form
          name="register"
          method="post"
          submitHandlers={{ submitHandler }}
          methods={methods}
          className="text-end"
        >
          <FormField labelText="Name" inputName="name" type="text" needFocus />
          <FormField labelText="Email" inputName="email" type="email" />
          <FormPasswordField showForgotPasswordLink showStrength showRules />
          <input type="submit" value="Register" className="btn btn-primary" />
        </Form>
      </main>
    </>
  )
}

export default Register
