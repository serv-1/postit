import { joiResolver } from '@hookform/resolvers/joi'
import { getProviders, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import useToast from 'hooks/useToast'
import type { UnPromise } from 'types'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PasswordInput from 'components/PasswordInput'
import signInSchema, { type SignIn } from 'schemas/signIn'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import { DATA_INVALID } from 'constants/errors'

interface AuthenticationSignInFormProps {
  providers: UnPromise<ReturnType<typeof getProviders>>
  setForgotPassword: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AuthenticationSignInForm({
  providers,
  setForgotPassword,
}: AuthenticationSignInFormProps) {
  const methods = useForm<SignIn>({
    resolver: joiResolver(signInSchema),
  })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<SignIn> = async (data) => {
    const res = await signIn<'credentials'>('credentials', {
      ...data,
      redirect: false,
    })

    if (res && res.error) {
      return setToast({ message: DATA_INVALID, error: true })
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
          <Input<SignIn>
            id="signInEmail"
            type="email"
            name="email"
            needFocus
            className="bg-fuchsia-50 md:bg-fuchsia-100"
          />
          <InputError<SignIn> inputName="email" />
        </div>
        <div className="mb-16">
          <label htmlFor="signInPassword" className="inline-block w-1/2">
            Password
          </label>
          <button
            type="button"
            className="inline-block w-1/2 text-fuchsia-600 text-s text-right hover:underline"
            onClick={() => setForgotPassword(true)}
          >
            Forgot password?
          </button>
          <PasswordInput<SignIn>
            id="signInPassword"
            className="bg-fuchsia-50 md:bg-fuchsia-100"
          />
          <InputError<SignIn> inputName="password" />
        </div>
        <button className="primary-btn block ml-auto">Sign in</button>
      </Form>
      <div className="flex flex-row flex-nowrap items-center gap-x-4 font-bold text-center rounded-full my-16 before:block before:h-[1px] before:w-1/2 before:bg-fuchsia-900 after:block after:h-[1px] after:w-1/2 after:bg-fuchsia-900">
        Or
      </div>
      {providers &&
        Object.values(providers).map(
          ({ id, name }) =>
            id === 'credentials' ||
            id === 'email' || (
              <button
                key={id}
                className="primary-btn w-full"
                onClick={() =>
                  signIn(id, {
                    callbackUrl: NEXT_PUBLIC_VERCEL_URL + '/profile',
                  })
                }
              >
                Sign in with {name}
              </button>
            )
        )}
    </>
  )
}
