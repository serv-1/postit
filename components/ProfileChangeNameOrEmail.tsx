import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import { EmailCsrfSchema, emailCsrfSchema } from '../lib/joi/emailSchema'
import { NameCsrfSchema, nameCsrfSchema } from '../lib/joi/nameSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import Form from './Form'
import InputError from './InputError'
import Input from './Input'
import Pencil from '../public/static/images/pencil.svg'
import Check from '../public/static/images/check.svg'
import X from '../public/static/images/x.svg'

type FormFields<T> = T extends 'name' ? NameCsrfSchema : EmailCsrfSchema

interface ProfileChangeNameOrEmailProps {
  type: 'name' | 'email'
  value: string
}

const ProfileChangeNameOrEmail = (props: ProfileChangeNameOrEmailProps) => {
  const { type } = props
  type Type = typeof type

  const [showForm, setShowForm] = useState(false)
  const [value, setValue] = useState(props.value)

  const { setToast } = useToast()

  const schema = type === 'name' ? nameCsrfSchema : emailCsrfSchema
  const methods = useForm<FormFields<Type>>({ resolver: joiResolver(schema) })

  const submitHandler: SubmitHandler<FormFields<Type>> = async (data) => {
    const newValue = 'name' in data ? data.name : data.email

    if (newValue === value) return setShowForm(false)

    try {
      await axios.put('http://localhost:3000/api/user', data)

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
      methods={methods}
      submitHandler={submitHandler}
      needCsrfToken
      className="flex first-of-type:mb-8"
    >
      <Input<FormFields<Type>>
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
      <InputError<FormFields<Type>> inputName={type} />
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
