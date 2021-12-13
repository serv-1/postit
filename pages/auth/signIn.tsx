import Head from 'next/head'
import { GetServerSideProps } from 'next'
import {
  getCsrfToken,
  signIn,
  getProviders,
  LiteralUnion,
  ClientSafeProvider,
} from 'next-auth/react'
// commonJS needed https://github.com/react-hook-form/resolvers/issues/271
const { joiResolver } = require('@hookform/resolvers/joi')
import { SubmitHandler, useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { signInSchema } from '../../utils/joiSchemas'
import TextInput from '../../components/TextInput'
import PasswordInput from '../../components/PasswordInput'
import Link from 'next/link'
import { BuiltInProviderType } from 'next-auth/providers'

type FormInput = {
  csrfToken: string
  email: string
  password: string
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      csrfToken: await getCsrfToken(ctx),
      providers: await getProviders(),
    },
  }
}

type Props = {
  csrfToken?: string | null
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null
}

const SignIn = ({ csrfToken, providers }: Props) => {
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    setFocus,
  } = useForm<FormInput>({
    resolver: joiResolver(signInSchema),
  })
  const router = useRouter()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    const res = await signIn<'credentials'>('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (res && res.error) {
      setError(res.error)
      return
    }
    router.push('/profile')
  }

  return (
    <>
      <Head>
        <title>Filanad - Sign in</title>
      </Head>
      <main>
        <section className="w-25 m-auto shadow rounded">
          <h2 className="bg-primary text-light rounded-top p-2 m-0">Sign in</h2>
          {error && (
            <div
              className="fw-bold p-2 pb-0 text-danger"
              id="globalFeedback"
              role="alert"
            >
              {error}
            </div>
          )}
          <form
            name="login"
            id="login"
            method="get"
            action=""
            encType="application/json"
            noValidate
            className="p-2 text-end"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              type="hidden"
              name="csrfToken"
              defaultValue={csrfToken || undefined}
            />
            <TextInput
              email
              name="email"
              labelName="Email"
              register={register}
              error={errors.email}
              isFormSubmitted={isSubmitted}
              setFocus={setFocus}
            />
            <PasswordInput
              name="password"
              register={register}
              labelName="Password"
              error={errors.password}
              isFormSubmitted={isSubmitted}
            />
            <div className="d-flex justify-content-between align-items-end">
              <Link href="/signup">
                <a className="text-decoration-none">Create an account</a>
              </Link>
              <input
                type="submit"
                value="Sign in"
                className="btn btn-primary"
              />
            </div>
          </form>
        </section>
        {providers &&
          Object.values(providers).map(
            (provider) =>
              provider.id === 'credentials' || (
                <button
                  key={provider.id}
                  className="btn btn-primary d-block m-auto w-25 mt-4"
                  onClick={() =>
                    signIn(provider.id, {
                      callbackUrl: 'http://localhost:3000/profile',
                    })
                  }
                >
                  Sign in with <span className="fw-bold">{provider.name}</span>
                </button>
              )
          )}
      </main>
    </>
  )
}

export default SignIn
