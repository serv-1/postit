import Head from 'next/head'
import { GetServerSideProps } from 'next'
import * as NextAuth from 'next-auth/react'
import { joiResolver } from '@hookform/resolvers/joi'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { signInSchema } from '../../utils/joiSchemas'
import Link from 'next/link'
import { BuiltInProviderType } from 'next-auth/providers'
import Form from '../../components/Form'
import FormTextField from '../../components/FormTextField'
import FormPasswordField from '../../components/FormPasswordField'
import Button from '../../components/Button'
import { useToast } from '../../contexts/toast'
import Toast from '../../components/Toast'

interface FormFields {
  email: string
  password: string
}

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
  const methods = useForm<FormFields>({ resolver: joiResolver(signInSchema) })
  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
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
        setToast({ message: err, background: 'danger' })
      }
      return
    }
    router.push('/profile')
  }

  return (
    <>
      <Head>
        <title>Filanad - Sign in</title>
      </Head>
      <main className="my-4">
        <Toast />
        <section className="w-25 m-auto shadow rounded">
          <h1 className="bg-primary text-light rounded-top p-2 m-0">Sign in</h1>
          <Form
            name="signin"
            method="post"
            submitHandlers={{ submitHandler }}
            methods={methods}
          >
            <FormTextField
              labelText="Email"
              inputName="email"
              type="email"
              needFocus
            />
            <FormPasswordField showForgotPasswordLink />
            <div className="d-flex justify-content-between align-items-end">
              <Link href="/register">
                <a className="text-decoration-none">Create an account</a>
              </Link>
              <input
                type="submit"
                value="Sign in"
                className="btn btn-primary"
              />
            </div>
          </Form>
        </section>
        {providers &&
          Object.values(providers).map(
            (provider) =>
              provider.id === 'credentials' ||
              provider.id === 'email' || (
                <Button
                  key={provider.id}
                  data-cy={`${provider.id}Btn`}
                  className="btn-primary d-block m-auto w-25 mt-4"
                  onClick={() =>
                    NextAuth.signIn(provider.id, {
                      callbackUrl: 'http://localhost:3000/profile',
                    })
                  }
                >
                  Sign in with <span className="fw-bold">{provider.name}</span>
                </Button>
              )
          )}
      </main>
    </>
  )
}

export default SignIn
