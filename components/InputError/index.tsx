import { ComponentPropsWithoutRef } from 'react'
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form'

interface InputErrorProps<FormFields extends FieldValues = FieldValues>
  extends ComponentPropsWithoutRef<'div'> {
  inputName: FieldPath<FormFields>
}

export default function InputError<
  FormFields extends FieldValues = FieldValues
>({ inputName, ...props }: InputErrorProps<FormFields>) {
  const { formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState
  const error = errors[inputName]

  return isSubmitted && error ? (
    <div
      {...props}
      id={`${inputName}Feedback`}
      role="alert"
      className="text-rose-600 font-bold"
    >
      {error.message as string}
    </div>
  ) : null
}
