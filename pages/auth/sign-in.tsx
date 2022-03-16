import Head from 'next/head'
import { GetServerSideProps } from 'next'
import * as NextAuth from 'next-auth/react'
import { joiResolver } from '@hookform/resolvers/joi'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import Link from '../../components/Link'
import { BuiltInProviderType } from 'next-auth/providers'
import Form from '../../components/Form'
import Button from '../../components/Button'
import { useToast } from '../../contexts/toast'
import { SignInSchema, signInSchema } from '../../lib/joi/signInSchema'
import Input from '../../components/Input'
import InputError from '../../components/InputError'
import PasswordInput from '../../components/PasswordInput'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      providers: await NextAuth.getProviders(),
    },
  }
}

interface SignInProps {
  providers: Record<
    NextAuth.LiteralUnion<BuiltInProviderType, string>,
    NextAuth.ClientSafeProvider
  > | null
}

const SignIn = ({ providers }: SignInProps) => {
  const methods = useForm<SignInSchema>({ resolver: joiResolver(signInSchema) })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<SignInSchema> = async (data) => {
    const res = await NextAuth.signIn<'credentials'>('credentials', {
      ...data,
      redirect: false,
    })
    if (res && res.error) {
      const err = res.error
      if (new RegExp(/email/i).test(err)) {
        methods.setError('email', { message: err }, { shouldFocus: true })
      } else if (new RegExp(/password/i).test(err)) {
        methods.setError('password', { message: err }, { shouldFocus: true })
      } else {
        setToast({ message: err, error: true })
      }
      return
    }
    router.push('/profile')
  }

  return (
    <>
      <Head>
        <title>Sign in - Filanad</title>
      </Head>
      <main
        data-cy="signIn"
        className="py-32 grid grid-cols-4 gap-x-16 justify-center"
      >
        <h1 className="col-span-full mb-16 text-4xl md:text-t-4xl lg:text-d-4xl font-bold">
          Sign in
        </h1>
        <Form
          name="signin"
          method="post"
          methods={methods}
          submitHandler={submitHandler}
          className="col-span-full"
        >
          <div className="mb-16">
            <label htmlFor="email">Email</label>
            <Input<SignInSchema> type="email" name="email" />
            <InputError<SignInSchema> inputName="email" />
          </div>

          <div className="mb-16">
            <label htmlFor="password">Password</label>
            <PasswordInput<SignInSchema> />
            <InputError<SignInSchema> inputName="password" />
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </Form>
        <div className="my-32 col-span-full text-center">Or</div>
        {providers &&
          Object.values(providers).map(
            (provider) =>
              provider.id === 'credentials' ||
              provider.id === 'email' || (
                <Button
                  key={provider.id}
                  data-cy={`${provider.id}Btn`}
                  className="col-span-full"
                  onClick={() =>
                    NextAuth.signIn(provider.id, {
                      callbackUrl: 'http://localhost:3000/profile',
                    })
                  }
                >
                  Sign in with{' '}
                  <span className="font-bold">{provider.name}</span>
                </Button>
              )
          )}
        <div className="col-span-full mt-32 text-center">
          <Link
            href="/register"
            className="text-indigo-600 text-base font-normal"
          >
            Create an account
          </Link>
          <span className="mx-16">•</span>
          <Link
            href="/auth/forgot-password"
            className="text-indigo-600 text-base font-normal"
          >
            Forgot password?
          </Link>
        </div>
      </main>
    </>
  )
}

SignIn.needAuth = false

export default SignIn
