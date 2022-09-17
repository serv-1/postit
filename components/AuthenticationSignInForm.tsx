import { joiResolver } from '@hookform/resolvers/joi'
import { getProviders, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { UnPromise } from '../types/common'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import PasswordInput from './PasswordInput'
import Button from './Button'
import signInSchema, { SignInSchema } from '../schemas/signInSchema'

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL

interface AuthenticationSignInFormProps {
  providers: UnPromise<ReturnType<typeof getProviders>>
  setForgotPassword: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthenticationSignInForm = (props: AuthenticationSignInFormProps) => {
  const methods = useForm<SignInSchema>({
    resolver: joiResolver(signInSchema),
  })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<SignInSchema> = async (data) => {
    const res = await signIn<'credentials'>('credentials', {
      ...data,
      redirect: false,
    })

    if (res && res.error) {
      const { name, message } = JSON.parse(res.error)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      return setToast({ message, error: true })
    }

    router.push('/profile')
  }

  return (
    <>
      <Form
        name="signin"
        method="post"
        methods={methods}
        submitHandler={submitHandler}
      >
        <div className="mb-16">
          <label htmlFor="signInEmail">Email</label>
          <Input<SignInSchema>
            id="signInEmail"
            type="email"
            name="email"
            needFocus
            bgColor="md:bg-fuchsia-100"
          />
          <InputError<SignInSchema> inputName="email" />
        </div>

        <div className="mb-16">
          <label htmlFor="signInPassword" className="inline-block w-1/2">
            Password
          </label>
          <button
            type="button"
            className="inline-block w-1/2 text-fuchsia-600 text-s text-right hover:underline"
            onClick={() => props.setForgotPassword(true)}
          >
            Forgot password?
          </button>
          <PasswordInput<SignInSchema>
            id="signInPassword"
            bgColor="bg-fuchsia-50 md:bg-fuchsia-100"
          />
          <InputError<SignInSchema> inputName="password" />
        </div>

        <div className="flex justify-end">
          <Button color="primary">Sign in</Button>
        </div>
      </Form>
      <div className="flex flex-row flex-nowrap items-center gap-x-4 font-bold text-center rounded-full my-16 before:block before:h-[1px] before:w-1/2 before:bg-fuchsia-900 after:block after:h-[1px] after:w-1/2 after:bg-fuchsia-900">
        Or
      </div>
      {props.providers &&
        Object.values(props.providers).map(
          ({ id, name }) =>
            id === 'credentials' ||
            id === 'email' || (
              <Button
                key={id}
                color="primary"
                fullWidth
                onClick={() =>
                  signIn(id, { callbackUrl: baseUrl + '/profile' })
                }
              >
                Sign in with {name}
              </Button>
            )
        )}
    </>
  )
}

export default AuthenticationSignInForm
