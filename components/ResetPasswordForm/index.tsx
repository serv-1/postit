'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import Form from 'components/Form'
import InputError from 'components/InputError'
import PasswordInput from 'components/PasswordInput'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import resetPasswordSchema, {
  type ResetPassword,
} from 'schemas/client/resetPassword'

interface ResetPasswordForm {
  userId: string
  token: string
}

export default function ResetPasswordForm({
  userId,
  token,
}: ResetPasswordForm) {
  const [error, setError] = useState<string>()

  const methods = useForm<ResetPassword>({
    resolver: joiResolver(resetPasswordSchema),
  })

  const router = useRouter()

  const submitHandler: SubmitHandler<ResetPassword> = async (data) => {
    const response = await ajax.put('/reset-password', {
      password: data.password,
      userId,
      token,
    })

    if (!response.ok) {
      const { message } = await response.json()

      setError(message)

      return
    }

    showToast({ message: 'Your password has been updated! 🎉' })
    router.push('/authentication')
  }

  return (
    <Form
      name="resetPassword"
      methods={methods}
      submitHandler={submitHandler}
      method="post"
      className="md:w-[350px]"
    >
      <label htmlFor="password">Password</label>
      <PasswordInput
        className="bg-fuchsia-50 md:bg-fuchsia-100"
        needFocus
        showStrength
      />
      <InputError name="password" />
      <button className="primary-btn block ml-auto mt-16">Confirm</button>
      {error && (
        <div role="alert" className="mt-16 font-bold text-rose-600">
          {error}
        </div>
      )}
    </Form>
  )
}
