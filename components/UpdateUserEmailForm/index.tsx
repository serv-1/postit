'use client'

import { useForm, type SubmitHandler } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import updateUserEmail, { type UpdateUserEmail } from 'schemas/updateUserEmail'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'

export default function UpdateUserEmailForm() {
  const methods = useForm<UpdateUserEmail>({
    resolver: joiResolver(updateUserEmail),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<UpdateUserEmail> = async (data) => {
    const response = await ajax.put('/user', data, { csrf: true })

    if (!response.ok) {
      const data: UserPutError = await response.json()

      methods.setError('email', data, { shouldFocus: true })

      return
    }

    setToast({ message: 'Your email has been updated! 🎉' })
  }

  return (
    <Form
      methods={methods}
      submitHandler={submitHandler}
      className="mb-16 md:mb-32"
    >
      <label htmlFor="email">Email</label>
      <div className="flex flex-row flex-nowrap">
        <Input<UpdateUserEmail>
          type="text"
          name="email"
          className="bg-fuchsia-100 rounded-r-none"
        />
        <button className="primary-btn rounded-l-none">Change</button>
      </div>
      <InputError<UpdateUserEmail> name="email" />
    </Form>
  )
}
