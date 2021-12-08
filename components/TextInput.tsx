import { FieldError, UseFormRegister } from 'react-hook-form'

type Props = {
  labelName: string
  email: boolean
  name: string
  isFormSubmitted: boolean
  error?: FieldError
  register: UseFormRegister<any>
}

const TextInput = (props: Props) => {
  const { labelName, email, name, isFormSubmitted, error, register } = props
  const type = email ? 'email' : 'text'
  const className = isFormSubmitted && (error ? ' is-invalid' : ' is-valid')
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
        className={`form-control${className || ''}`}
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
