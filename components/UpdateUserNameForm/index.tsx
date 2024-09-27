'use client'

import { useForm, type SubmitHandler } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import updateUserName, { type UpdateUserName } from 'schemas/updateUserName'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'

export default function UpdateUserNameForm() {
  const methods = useForm<UpdateUserName>({
    resolver: joiResolver(updateUserName),
  })

  const submitHandler: SubmitHandler<UpdateUserName> = async (data) => {
    const response = await ajax.put('/user', data, { csrf: true })

    if (!response.ok) {
      const data: UserPutError = await response.json()

      methods.setError('name', data, { shouldFocus: true })

      return
    }

    showToast({ message: 'Your name has been updated! 🎉' })

    document.dispatchEvent(
      new CustomEvent('updateProfileUserName', { detail: { name: data.name } })
    )
  }

  return (
    <Form
      methods={methods}
      submitHandler={submitHandler}
      className="mb-16 md:mb-32"
    >
      <label htmlFor="name">Name</label>
      <div className="flex flex-row flex-nowrap">
        <Input<UpdateUserName>
          type="text"
          name="name"
          className="bg-fuchsia-100 rounded-r-none"
        />
        <button className="primary-btn rounded-l-none">Change</button>
      </div>
      <InputError<UpdateUserName> name="name" />
    </Form>
  )
}
