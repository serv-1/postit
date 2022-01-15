import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { ValidationError } from 'joi'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import err from '../utils/errors'
import { emailSchema, nameSchema } from '../utils/joiSchemas'
import Button from './Button'
import Form from './Form'
import InputError from './InputError'
import TextInput from './TextInput'
import Pencil from '../public/static/images/pencil.svg'
import X from '../public/static/images/x-lg.svg'
import Check from '../public/static/images/check-lg.svg'

type FormFields = { name: string } | { email: string }

export interface ProfileChangeNameOrEmailProps {
  subject: 'name' | 'email'
}

const ProfileChangeNameOrEmail = ({
  subject,
}: ProfileChangeNameOrEmailProps) => {
  const { data } = useSession()
  const user = (data as Session).user
  const [subjectValue, setSubjectValue] = useState(user[subject])
  const [showForm, setShowForm] = useState(false)
  const { setToast } = useToast()
  const resolver = joiResolver(subject === 'name' ? nameSchema : emailSchema)
  const methods = useForm<FormFields>({ resolver })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    const value = Object.values(data)[0]

    setShowForm(false)

    if (value === subjectValue) return

    try {
      await axios.put(`http://localhost:3000/api/users/${user.id}`, data)

      setSubjectValue(value)
      setToast({
        message: `The ${subject} has been successfully updated! 🎉`,
        background: 'success',
      })
    } catch (e) {
      if (e instanceof ValidationError) {
        setToast({ message: e.details[0].message, background: 'danger' })
      }

      const res = (e as AxiosError).response

      if (!res) {
        return setToast({ message: err.NO_RESPONSE, background: 'danger' })
      }

      setToast({
        message: res.data.message || err.DEFAULT_SERVER_ERROR,
        background: 'danger',
      })
    }
  }

  return showForm ? (
    <Form
      name={`updateUser${subject[0].toUpperCase() + subject.slice(1)}`}
      method="post"
      submitHandlers={{ submitHandler }}
      methods={methods}
    >
      <div className="input-group w-50 m-auto d-flex align-items-center">
        <TextInput
          className="rounded"
          type={subject === 'name' ? 'text' : 'email'}
          defaultValue={subjectValue}
          name={subject}
          needFocus
        />
        <InputError inputName={subject} />
        <Button
          className="p-0 ms-2"
          aria-label="Cancel"
          onClick={() => setShowForm(false)}
        >
          ❌
        </Button>
        <Button className="p-0 ms-2" aria-label="Submit" type="submit">
          ✔
        </Button>
      </div>
    </Form>
  ) : (
    <div className="input-group w-50 m-auto d-flex align-items-center">
      <span className={subject === 'name' ? 'fw-bold fs-1' : 'fs-5'}>
        {subjectValue}
      </span>
      <Button aria-label="Edit" onClick={() => setShowForm(true)}>
        ✏
      </Button>
    </div>
  )
}

export default ProfileChangeNameOrEmail
