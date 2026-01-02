'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form'
import showToast from 'functions/showToast'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PasswordInput from 'components/PasswordInput'
import signInSchema, { type SignIn } from 'schemas/signIn'
import { DATA_INVALID } from 'constants/errors'
import Link from 'next/link'

export default function SignInForm() {
  const methods = useForm<SignIn>({
    resolver: joiResolver(signInSchema),
  })

  const router = useRouter()
  const email = useWatch({ name: 'email', control: methods.control })

  const submitHandler: SubmitHandler<SignIn> = async (data) => {
    const res = await signIn('credentials', {
      ...data,
      redirect: false,
    })

    if (res && res.error) {
      showToast({ message: DATA_INVALID, error: true })

      return
    }

    router.push('/profile')
  }

  return (
    <Form
      name="signin"
      method="post"
      methods={methods}
      submitHandler={submitHandler}
    >
      <div className="mb-16">
        <label htmlFor="signInEmail">Email</label>
        <Input<SignIn>
          id="signInEmail"
          type="email"
          name="email"
          needFocus
          className="bg-fuchsia-50 md:bg-fuchsia-100"
        />
        <InputError<SignIn> name="email" />
      </div>
      <div className="mb-16 flex flex-row flex-wrap">
        <label htmlFor="signInPassword">Password</label>
        <Link
          href={
            '/reset-password' +
            (email ? '?email=' + encodeURIComponent(email) : '')
          }
          className="ml-auto"
        >
          Forgot password?
        </Link>
        <PasswordInput<SignIn>
          id="signInPassword"
          className="bg-fuchsia-50 md:bg-fuchsia-100"
        />
        <InputError<SignIn> name="password" />
      </div>
      <button className="primary-btn block ml-auto">Sign in</button>
    </Form>
  )
}
