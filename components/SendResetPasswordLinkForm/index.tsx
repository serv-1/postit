'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import ajax from 'libs/ajax'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import sendResetPasswordLinkSchema, {
  type SendResetPasswordLink,
} from 'schemas/sendResetPasswordLink'

interface SendResetPasswordLinkFormProps {
  email?: string
}

type MessageState = { content: string; error?: boolean }

export default function SendResetPasswordLinkForm({
  email,
}: SendResetPasswordLinkFormProps) {
  const [message, setMessage] = useState<MessageState>()
  const methods = useForm<SendResetPasswordLink>({
    resolver: joiResolver(sendResetPasswordLinkSchema),
  })

  const submitHandler: SubmitHandler<SendResetPasswordLink> = async (data) => {
    const response = await ajax.post('/send-email', data)

    if (!response.ok) {
      const { message } = await response.json()

      setMessage({ content: message, error: true })

      return
    }

    setMessage({ content: 'Email successfully sent!' })
  }

  return (
    <Form
      name="sendResetPasswordLink"
      methods={methods}
      submitHandler={submitHandler}
      method="post"
      className="md:w-[350px]"
    >
      <label htmlFor="email">Email</label>
      <Input
        name="email"
        type="email"
        registerOptions={{ value: email }}
        className="bg-fuchsia-50 md:bg-fuchsia-100"
      />
      <InputError name="email" />
      <button type="submit" className="primary-btn block ml-auto mt-16">
        Send link
      </button>
      {message && (
        <div
          role="alert"
          className={
            'mt-16 font-bold ' +
            (message.error ? 'text-rose-600' : 'text-fuchsia-600')
          }
        >
          {message.content}
        </div>
      )}
    </Form>
  )
}
