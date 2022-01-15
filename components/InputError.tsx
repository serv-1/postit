import { useFormContext } from 'react-hook-form'

export interface InputErrorProps {
  inputName: string
}

const InputError = ({ inputName }: InputErrorProps) => {
  const { formState } = useFormContext()
  const { isSubmitted, errors } = formState

  const name = inputName[0].toUpperCase() + inputName.slice(1)

  return isSubmitted && errors[inputName] ? (
    <div className="invalid-feedback" id={`feedback${name}`} role="alert">
      {errors[inputName].message}
    </div>
  ) : null
}

export default InputError
