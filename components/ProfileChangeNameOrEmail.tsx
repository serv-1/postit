import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { emailCsrfSchema } from '../lib/joi/emailSchema'
import { nameCsrfSchema } from '../lib/joi/nameSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import Form from './Form'
import InputError from './InputError'
import Input from './Input'

type FormFields<T> = { csrfToken?: string } & (T extends 'name'
  ? { name: string }
  : { email: string })

export interface ProfileChangeNameOrEmailProps {
  type: 'name' | 'email'
  value: string
}

const ProfileChangeNameOrEmail = (props: ProfileChangeNameOrEmailProps) => {
  const { type, value: val } = props
  type Type = typeof type

  const [showForm, setShowForm] = useState(false)
  const [value, setValue] = useState(val)

  const { setToast } = useToast()

  const schema = type === 'name' ? nameCsrfSchema : emailCsrfSchema
  const methods = useForm<FormFields<Type>>({ resolver: joiResolver(schema) })

  const submitHandler: SubmitHandler<FormFields<Type>> = async (data) => {
    const csrfToken = data.csrfToken
    delete data.csrfToken

    const newValue = Object.values(data)[0]

    if (newValue === value) return setShowForm(false)

    try {
      await axios.put('http://localhost:3000/api/user', { csrfToken, ...data })

      setShowForm(false)
      setValue(newValue)
      setToast({
        message: `The ${type} has been successfully updated! 🎉`,
        background: 'success',
      })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      methods.setError(type, { message }, { shouldFocus: true })
    }
  }

  return showForm ? (
    <Form
      name={`updateUser${type[0].toUpperCase() + type.slice(1)}`}
      method="post"
      submitHandlers={{ submitHandler }}
      methods={methods}
      needCsrfToken
    >
      <div className="input-group">
        <Input
          className="rounded"
          type={type === 'name' ? 'text' : 'email'}
          defaultValue={value}
          name={type}
          needFocus
        />
        <Button
          type="button"
          className="p-0 ms-2"
          aria-label="Cancel"
          onClick={() => setShowForm(false)}
        >
          ❌
        </Button>
        <Button className="p-0 ms-2" aria-label="Submit" type="submit">
          ✔
        </Button>
        <InputError inputName={type} />
      </div>
    </Form>
  ) : (
    <div className="input-group d-flex align-items-center">
      <span className={type === 'name' ? 'fw-bold fs-1' : 'fs-5'}>{value}</span>
      <Button aria-label="Edit" onClick={() => setShowForm(true)}>
        ✏
      </Button>
    </div>
  )
}

export default ProfileChangeNameOrEmail
