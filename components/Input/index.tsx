import classNames from 'classnames'
import { useEffect } from 'react'
import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form'

type InputProps<FormFields extends FieldValues> = {
  id?: string
  name: FieldPath<FormFields>
  multiple?: boolean
  ariaDescribedBy?: string
  registerOptions?: RegisterOptions<FormFields>
  type: 'text' | 'email' | 'number' | 'file' | 'password' | 'search'
  placeholder?: string
  needFocus?: boolean
  className?: string
  addOn?: React.ReactNode
}

export default function Input<FormFields extends FieldValues>({
  type,
  id,
  name,
  registerOptions,
  needFocus,
  className,
  addOn,
  placeholder,
  ariaDescribedBy,
  multiple,
}: InputProps<FormFields>) {
  const { register, setFocus, formState } = useFormContext<FormFields>()
  const { errors } = formState

  useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  return (
    <div
      className={classNames(
        'p-8 border-b-2 transition-colors duration-200 rounded w-full flex flex-row flex-nowrap items-center',
        className,
        errors[name]
          ? 'border-2 border-rose-600 focus-within:border-rose-900'
          : 'border-fuchsia-900/25 focus-within:border-fuchsia-900/75'
      )}
    >
      <input
        {...register(name, registerOptions)}
        id={id || name}
        type={type}
        multiple={multiple}
        placeholder={placeholder}
        aria-describedby={classNames(name + 'Feedback', ariaDescribedBy)}
        className={
          type === 'file'
            ? 'file:border-none file:text-fuchsia-900 file:bg-fuchsia-100 hover:file:bg-fuchsia-600 hover:file:text-fuchsia-50 file:transition-colors file:duration-200 cursor-pointer file:cursor-pointer file:rounded w-full'
            : 'outline-none placeholder:text-fuchsia-900/50 bg-transparent w-full'
        }
      />
      {addOn}
    </div>
  )
}
