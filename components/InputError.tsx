import { ComponentPropsWithoutRef } from 'react'
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form'

interface InputErrorProps<FormFields extends FieldValues = FieldValues>
  extends ComponentPropsWithoutRef<'div'> {
  inputName: FieldPath<FormFields>
}

const InputError = <FormFields extends FieldValues = FieldValues>({
  inputName,
  ...props
}: InputErrorProps<FormFields>) => {
  const { formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState

  return isSubmitted && errors[inputName] ? (
    <div
      {...props}
      id={`${inputName}Feedback`}
      role="alert"
      className="text-red-600 font-bold"
    >
      {errors[inputName].message}
    </div>
  ) : null
}

export default InputError
