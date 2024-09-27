'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import showToast from 'functions/showToast'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PasswordInput from 'components/PasswordInput'
import signInSchema, { type SignIn } from 'schemas/signIn'
import { DATA_INVALID } from 'constants/errors'

export default function SignInForm() {
  const methods = useForm<SignIn>({
    resolver: joiResolver(signInSchema),
  })

  const router = useRouter()

  const submitHandler: SubmitHandler<SignIn> = async (data) => {
    const res = await signIn<'credentials'>('credentials', {
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
      <div className="mb-16">
        <label htmlFor="signInPassword">Password</label>
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
