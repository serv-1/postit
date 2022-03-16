import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import Form from '../components/Form'
import getAxiosError from '../utils/functions/getAxiosError'
import { useToast } from '../contexts/toast'
import { RegisterSchema, registerSchema } from '../lib/joi/registerSchema'
import Button from '../components/Button'
import Input from '../components/Input'
import InputError from '../components/InputError'
import PasswordInput from '../components/PasswordInput'

const Register = () => {
  const methods = useForm<RegisterSchema>({
    resolver: joiResolver(registerSchema),
  })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<RegisterSchema> = async (data) => {
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
      type FieldsNames = keyof RegisterSchema
      const { name, message } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Head>
        <title>Register - Filanad</title>
      </Head>
      <main className="py-32 grid grid-cols-4 gap-x-16 justify-center">
        <h1 className="text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16 col-span-full">
          Register
        </h1>
        <Form
          name="register"
          method="post"
          methods={methods}
          submitHandler={submitHandler}
          className="col-span-full"
        >
          <div className="mb-16">
            <label htmlFor="name">Name</label>
            <Input<RegisterSchema> type="text" name="name" needFocus />
            <InputError<RegisterSchema> inputName="name" />
          </div>

          <div className="mb-16">
            <label htmlFor="email">Email</label>
            <Input<RegisterSchema> type="email" name="email" />
            <InputError<RegisterSchema> inputName="email" />
          </div>

          <div className="mb-16">
            <label htmlFor="password">Password</label>
            <div className="text-s mb-4" id="passwordRules" role="note">
              It must be 10-20 characters long. It must not equal the others
              fields&apos; value. There is no characters restriction so you can
              use emojis, cyrillic, etc.
            </div>
            <PasswordInput<RegisterSchema>
              showStrength
              aria-describedby="passwordRules"
            />
            <InputError<RegisterSchema> inputName="password" />
          </div>

          <Button type="submit" className="w-full">
            Register
          </Button>
        </Form>
      </main>
    </>
  )
}

Register.needAuth = false

export default Register
