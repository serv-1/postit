import { ComponentPropsWithoutRef } from 'react'
import { useFormContext } from 'react-hook-form'
import classNames from 'classnames'

export interface InputErrorProps extends ComponentPropsWithoutRef<'div'> {
  inputName: string
}

const InputError = ({ inputName, className, ...props }: InputErrorProps) => {
  const { formState } = useFormContext()
  const { isSubmitted, errors } = formState

  const divClass = classNames('invalid-feedback', className)

  return isSubmitted && errors[inputName] ? (
    <div
      {...props}
      className={divClass}
      id={`${inputName}Feedback`}
      role="alert"
    >
      {errors[inputName].message}
    </div>
  ) : null
}

export default InputError
