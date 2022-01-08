import axios, { AxiosError } from 'axios'
import Joi, { ValidationError } from 'joi'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { useToast } from '../contexts/toast'
import err from '../utils/errors'
import { emailRules, nameRules } from '../utils/joiSchemas'

const UpdateNameOrEmail = ({ subject }: { subject: 'name' | 'email' }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showInput, setShowInput] = useState(false)
  const { setToast } = useToast()
  const { data } = useSession()
  const user = (data as Session).user
  const [subjectValue, setSubjectValue] = useState(user[subject])

  useEffect(() => {
    if (showInput) inputRef.current?.focus()
  }, [showInput])

  const updateSubject = async (value: string) => {
    setShowInput(false)
    if (value === subjectValue) return
    try {
      Joi.assert(value, subject === 'name' ? nameRules : emailRules)
      await axios.put<null>(`http://localhost:3000/api/users/${user.id}`, {
        [subject]: value,
      })
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

  const attributes = {
    tabIndex: 0,
    title: `Click to change your ${subject}`,
    onClick: () => setShowInput(true),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') setShowInput(true)
    },
    style: { cursor: 'pointer' },
  }

  return showInput ? (
    <input
      className="w-25 d-block m-auto"
      ref={inputRef}
      type={subject === 'name' ? 'text' : 'email'}
      name={subject}
      defaultValue={subjectValue}
      aria-label={`Change your ${subject}`}
      onBlur={(e) => updateSubject(e.target.value)}
      onKeyDown={(e) =>
        e.key === 'Enter' && updateSubject(e.currentTarget.value)
      }
    />
  ) : subject === 'name' ? (
    <span {...attributes}>{subjectValue}</span>
  ) : (
    <small {...attributes} className="fs-6 d-block">
      ({subjectValue})
    </small>
  )
}

export default UpdateNameOrEmail
