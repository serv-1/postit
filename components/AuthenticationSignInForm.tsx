import { joiResolver } from '@hookform/resolvers/joi'
import { getProviders, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { signInSchema, SignInSchema } from '../lib/joi/signInSchema'
import { UnPromise } from '../types/common'
import Button from './Button'
import Form from './Form'
import Input from './Input'
import InputError from './InputError'
import PasswordField from './PasswordField'

interface AuthenticationSignInFormProps {
  providers: UnPromise<ReturnType<typeof getProviders>>
}

const AuthenticationSignInForm = (props: AuthenticationSignInFormProps) => {
  const methods = useForm<SignInSchema>({ resolver: joiResolver(signInSchema) })

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
          <label htmlFor="email">Email</label>
          <Input<SignInSchema>
            type="email"
            name="email"
            needFocus
            className="md:bg-fuchsia-100"
          />
          <InputError<SignInSchema> inputName="email" />
        </div>

        <PasswordField<SignInSchema>
          showForgotLink
          inputClass="md:bg-fuchsia-100"
          containerClass="md:bg-fuchsia-100"
        />

        <Button type="submit" className="relative left-full -translate-x-full">
          Sign in
        </Button>
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
                data-cy={`${id}Btn`}
                className="w-full"
                onClick={() =>
                  signIn(id, { callbackUrl: 'http://localhost:3000/profile' })
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