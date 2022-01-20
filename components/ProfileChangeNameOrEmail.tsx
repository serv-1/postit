import { joiResolver } from '@hookform/resolvers/joi'
import axios from 'axios'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useToast } from '../contexts/toast'
import getApiError from '../utils/getApiError'
import { emailCsrfSchema, nameCsrfSchema } from '../utils/joiSchemas'
import Button from './Button'
import Form from './Form'
import InputError from './InputError'
import TextInput from './TextInput'

type FormFields =
  | { csrfToken?: string; name: string }
  | { csrfToken?: string; email: string }

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
  const schema = subject === 'name' ? nameCsrfSchema : emailCsrfSchema
  const methods = useForm<FormFields>({ resolver: joiResolver(schema) })

  const submitHandler: SubmitHandler<FormFields> = async (data) => {
    const value = Object.values(data)[0]

    if (value === subjectValue) return setShowForm(false)

    try {
      await axios.put(`http://localhost:3000/api/users/${user.id}`, data)

      setShowForm(false)
      setSubjectValue(value)
      setToast({
        message: `The ${subject} has been successfully updated! 🎉`,
        background: 'success',
      })
    } catch (e) {
      const { message } = getApiError(e)
      methods.setError(subject, { message }, { shouldFocus: true })
    }
  }

  return showForm ? (
    <Form
      name={`updateUser${subject[0].toUpperCase() + subject.slice(1)}`}
      method="post"
      submitHandlers={{ submitHandler }}
      methods={methods}
      needCsrfToken
    >
      <div className="input-group">
        <TextInput
          className="rounded"
          type={subject === 'name' ? 'text' : 'email'}
          defaultValue={subjectValue}
          name={subject}
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
        <InputError inputName={subject} />
      </div>
    </Form>
  ) : (
    <div className="input-group d-flex align-items-center">
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
