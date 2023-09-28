import { joiResolver } from '@hookform/resolvers/joi'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from 'contexts/toast'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PasswordStrength from 'components/PasswordStrength'
import PasswordInput from 'components/PasswordInput'
import Button from 'components/Button'
import createUser, { type CreateUser } from 'schemas/createUser'
import ajax from 'libs/ajax'
import type { UserPostError } from 'app/api/user/types'

export default function AuthenticationRegisterForm() {
  const methods = useForm<CreateUser>({
    resolver: joiResolver(createUser),
  })

  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<CreateUser> = async (data) => {
    const response = await ajax.post('/user', data)

    if (!response.ok) {
      const { name, message }: UserPostError = await response.json()

      if (name) {
        methods.setError(name, { message }, { shouldFocus: true })

        return
      }

      setToast({ message, error: true })

      return
    }

    const signInResponse = await signIn<'credentials'>('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (signInResponse && signInResponse.error) {
      setToast({
        message:
          'Your account has been successfully created. You can now sign in!',
      })

      return
    }

    router.push(response.headers.get('location') as string)
  }

  return (
    <Form
      name="register"
      method="post"
      methods={methods}
      submitHandler={submitHandler}
    >
      <div className="mb-16">
        <label htmlFor="name">Name</label>
        <Input<CreateUser>
          type="text"
          name="name"
          needFocus
          bgColor="md:bg-fuchsia-100"
        />
        <InputError<CreateUser> inputName="name" />
      </div>

      <div className="mb-16">
        <label htmlFor="email">Email</label>
        <Input<CreateUser>
          type="email"
          name="email"
          bgColor="md:bg-fuchsia-100"
        />
        <InputError<CreateUser> inputName="email" />
      </div>

      <div className="mb-16">
        <label htmlFor="password" className="inline-block w-1/2">
          Password
        </label>
        <PasswordStrength className="inline-block w-1/2 text-right">
          {(onChange) => (
            <PasswordInput<CreateUser>
              onChange={onChange}
              bgColor="bg-fuchsia-50 md:bg-fuchsia-100"
            />
          )}
        </PasswordStrength>
        <InputError<CreateUser> inputName="password" />
      </div>

      <div className="flex justify-end">
        <Button color="primary">Register</Button>
      </div>
    </Form>
  )
}
