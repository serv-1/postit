import { ComponentPropsWithoutRef } from 'react'
import { useFormContext } from 'react-hook-form'

export interface InputErrorProps extends ComponentPropsWithoutRef<'div'> {
  inputName: string
}

const InputError = ({ inputName, ...props }: InputErrorProps) => {
  const { formState } = useFormContext()
  const { isSubmitted, errors } = formState

  return isSubmitted && errors[inputName] ? (
    <div
      {...props}
      id={`${inputName}Feedback`}
      role="alert"
      className="text-s text-red-600 mt-4"
    >
      {errors[inputName].message}
    </div>
  ) : null
}

export default InputError
