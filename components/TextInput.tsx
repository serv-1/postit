import { useEffect } from 'react'
import { FieldError, UseFormRegister, UseFormSetFocus } from 'react-hook-form'

type Props = {
  labelName: string
  email?: boolean
  name: string
  isFormSubmitted: boolean
  error?: FieldError
  register: UseFormRegister<any>
  setFocus?: UseFormSetFocus<any>
}

const TextInput = (props: Props) => {
  const { labelName, email, name, isFormSubmitted, error, register, setFocus } =
    props
  const type = email ? 'email' : 'text'
  const inputClass = isFormSubmitted && (error ? ' is-invalid' : ' is-valid')
  const feedbackName = name + 'Feedback'

  useEffect(() => {
    if (!setFocus) return
    setFocus(name)
  }, [setFocus, name])

  return (
    <div className="mb-3 text-start">
      <label htmlFor={name} className="form-label">
        {labelName}
      </label>
      <input
        {...register(name)}
        type={type}
        id={name}
        className={`form-control${inputClass || ''}`}
        aria-describedby={feedbackName}
      />
      {isFormSubmitted && error && (
        <div className="invalid-feedback" id={feedbackName} role="alert">
          {error.message}
        </div>
      )}
    </div>
  )
}

export default TextInput
