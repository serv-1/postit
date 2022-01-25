import { useFormContext } from 'react-hook-form'

export interface InputErrorProps {
  inputName: string
}

const InputError = ({ inputName }: InputErrorProps) => {
  const { formState } = useFormContext()
  const { isSubmitted, errors } = formState

  return isSubmitted && errors[inputName] ? (
    <div className="invalid-feedback" id={`${inputName}Feedback`} role="alert">
      {errors[inputName].message}
    </div>
  ) : null
}

export default InputError
