import {
  FieldError,
  RegisterOptions,
  UseFormRegisterReturn,
} from 'react-hook-form'

type Props = {
  labelName: string
  email: boolean
  name: string
  register: (name: string, opts?: RegisterOptions) => UseFormRegisterReturn
  isSubmitted: boolean
  error?: FieldError
}

const TextInput = (props: Props) => {
  const { labelName, email, name, register, isSubmitted, error } = props
  const type = email ? 'email' : 'text'
  const className = isSubmitted && (error ? 'is-invalid' : 'is-valid')
  const feedbackName = name + 'Feedback'

  return (
    <div className="mb-3 text-start">
      <label htmlFor={name} className="form-label">
        {labelName}
      </label>
      <input
        {...register(name)}
        type={type}
        id={name}
        className={`form-control ${className || undefined}`}
        aria-describedby={feedbackName}
      />
      {isSubmitted && error && (
        <div className="invalid-feedback" id={feedbackName} role="alert">
          {error.message}
        </div>
      )}
    </div>
  )
}

export default TextInput
