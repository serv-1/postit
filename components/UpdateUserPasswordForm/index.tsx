'use client'

import { useForm, type SubmitHandler } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Form from 'components/Form'
import InputError from 'components/InputError'
import updateUserPassword, {
  type UpdateUserPassword,
} from 'schemas/updateUserPassword'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'
import PasswordInput from 'components/PasswordInput'

export default function UpdateUserPasswordForm() {
  const methods = useForm<UpdateUserPassword>({
    resolver: joiResolver(updateUserPassword),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<UpdateUserPassword> = async (data) => {
    const response = await ajax.put('/user', data, { csrf: true })

    if (!response.ok) {
      const data: UserPutError = await response.json()

      methods.setError('password', data, { shouldFocus: true })

      return
    }

    setToast({ message: 'Your password has been updated! 🎉' })
  }

  return (
    <Form
      methods={methods}
      submitHandler={submitHandler}
      className="mb-16 md:mb-32"
    >
      <label htmlFor="password" className="w-1/2">
        Password
      </label>
      <div className="flex flex-row flex-nowrap">
        <PasswordInput<UpdateUserPassword>
          showStrength
          className="bg-fuchsia-100 rounded-r-none"
        />
        <button className="primary-btn rounded-l-none">Change</button>
      </div>
      <InputError<UpdateUserPassword> inputName="password" />
    </Form>
  )
}
