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
import Pencil from '../public/static/images/pencil.svg'
import Check from '../public/static/images/check.svg'
import X from '../public/static/images/x.svg'

type FormFields<T> = { csrfToken?: string } & (T extends 'name'
  ? { name: string }
  : { email: string })

interface ProfileChangeNameOrEmailProps {
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
      setToast({ message: `The ${type} has been updated! 🎉` })
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
      className="flex first-of-type:mb-8"
    >
      <Input
        className="leading-[16px] flex-grow"
        type={type === 'name' ? 'text' : 'email'}
        defaultValue={value}
        name={type}
        needFocus
      />
      <Button
        type="button"
        needDefaultClassNames={false}
        aria-label="Cancel"
        onClick={() => setShowForm(false)}
      >
        <X className="w-24 h-24 md:w-32 md:h-32" />
      </Button>
      <Button needDefaultClassNames={false} aria-label="Submit" type="submit">
        <Check className="w-24 h-24 md:w-32 md:h-32" />
      </Button>
      <InputError inputName={type} />
    </Form>
  ) : (
    <div className="flex justify-between first-of-type:mb-8">
      <span className="text-xl md:text-t-xl lg:text-d-xl">{value}</span>
      <Button
        needDefaultClassNames={false}
        aria-label="Edit"
        onClick={() => setShowForm(true)}
      >
        <Pencil className="w-24 h-24 md:w-32 md:h-32" />
      </Button>
    </div>
  )
}

export default ProfileChangeNameOrEmail
