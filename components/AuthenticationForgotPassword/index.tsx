import { joiResolver } from '@hookform/resolvers/joi'
import { signIn } from 'next-auth/react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import { useToast } from 'contexts/toast'
import Button from 'components/Button'
import forgotPwSchema, { type ForgotPwSchema } from 'schemas/forgotPwSchema'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import ajax from 'libs/ajax'
import type { VerifyEmailPostError } from 'app/api/verify-email/types'

interface AuthenticationFPProps {
  setForgotPassword: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AuthenticationForgotPassword({
  setForgotPassword,
}: AuthenticationFPProps) {
  const methods = useForm<ForgotPwSchema>({
    resolver: joiResolver(forgotPwSchema),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<ForgotPwSchema> = async (data) => {
    const response = await ajax.post('/verify-email', data)

    if (!response.ok) {
      const { message }: VerifyEmailPostError = await response.json()

      if (response.status !== 422) {
        setToast({ message, error: true })

        return
      }

      methods.setError('email', { message }, { shouldFocus: true })

      return
    }

    await signIn('email', {
      email: data.email,
      callbackUrl: NEXT_PUBLIC_VERCEL_URL + '/profile',
    })
  }

  return (
    <>
      <h1>Forgot password</h1>
      <p className="mt-16 mb-32">
        A mail will be sent to your email with a link to connect to your
        account. Once signed in, you will be able to change your password.
      </p>
      <Form
        name="sendMail"
        method="post"
        methods={methods}
        submitHandler={submitHandler}
      >
        <div className="mb-16">
          <label htmlFor="email">Email</label>
          <Input<ForgotPwSchema>
            type="email"
            name="email"
            needFocus
            bgColor="md:bg-fuchsia-100"
          />
          <InputError<ForgotPwSchema> inputName="email" />
        </div>
        <div className="flex justify-end">
          <Button color="primary">Send</Button>
        </div>
      </Form>
      <div className="flex-grow flex items-end">
        <button
          className="hover:underline text-fuchsia-600"
          onClick={() => setForgotPassword(false)}
        >
          ← Back to Authentication
        </button>
      </div>
    </>
  )
}
