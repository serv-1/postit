import { FieldError } from 'react-hook-form'

type Props = {
  labelName: string
  email: boolean
  name: string
  isFormSubmitted: boolean
  error?: FieldError
}

const TextInput = (props: Props) => {
  const { labelName, email, name, isFormSubmitted, error } = props
  const type = email ? 'email' : 'text'
  const className = isFormSubmitted && (error ? 'is-invalid' : 'is-valid')
  const feedbackName = name + 'Feedback'

  return (
    <div className="mb-3 text-start">
      <label htmlFor={name} className="form-label">
        {labelName}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        className={`form-control ${className || undefined}`}
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
