import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'

interface InputErrorProps<FormFields extends FieldValues> {
  name: FieldPath<FormFields>
}

export default function InputError<FormFields extends FieldValues>({
  name,
}: InputErrorProps<FormFields>) {
  const { formState } = useFormContext<FormFields>()
  const error = formState.errors[name]

  return error ? (
    <div
      id={`${name}Feedback`}
      role="alert"
      className="text-rose-600 font-bold"
    >
      {error.message as string}
    </div>
  ) : null
}
