import { ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react'
import {
  FieldPath,
  FieldError,
  UseFormRegister,
  UseFormSetFocus,
} from 'react-hook-form'

type Props<TFieldValues> = {
  labelName: string
  email?: boolean
  name: FieldPath<TFieldValues>
  isFormSubmitted: boolean
  error?: FieldError
  register: UseFormRegister<TFieldValues>
  setFocus?: UseFormSetFocus<TFieldValues>
  setValue?: Dispatch<SetStateAction<string | undefined>>
}

const TextInput = <TFieldValues,>({
  labelName,
  email,
  name,
  isFormSubmitted,
  error,
  register,
  setFocus,
  setValue,
}: Props<TFieldValues>) => {
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
        {...register(
          name,
          setValue && {
            onChange: (e: ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value),
          }
        )}
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
