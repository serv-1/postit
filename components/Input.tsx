import classNames from 'classnames'
import React, { ReactNode } from 'react'
import {
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form'

interface InputProps<FormFields extends FieldValues>
  extends React.ComponentPropsWithoutRef<'input'> {
  name: FieldPath<FormFields>
  registerOptions?: RegisterOptions<FormFields>
  type: 'text' | 'email' | 'number' | 'file' | 'password' | 'search'
  needFocus?: boolean
  addOn?: ReactNode
  addOnClass?: string
}

const Input = <FormFields extends FieldValues>({
  type,
  name,
  registerOptions,
  needFocus,
  className,
  addOn,
  addOnClass,
  ...props
}: InputProps<FormFields>) => {
  const { register, setFocus, formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState

  const border =
    isSubmitted && errors[name]
      ? 'border-2 border-red-600 focus-within:border-red-900'
      : 'border-[rgba(112,26,117,0.25)] focus-within:border-[rgba(112,26,117,0.75)]'

  const fileInputClass =
    'file:border-none file:p-8 file:mr-8 file:text-fuchsia-900 file:bg-fuchsia-100 rounded p-0 bg-fuchsia-50 hover:file:bg-fuchsia-600 hover:file:text-fuchsia-50 file:transition-colors cursor-pointer file:cursor-pointer w-full'

  const otherInputClass =
    'p-8 outline-none placeholder:text-[rgba(112,26,117,0.5)] bg-fuchsia-50 w-full'

  React.useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  const inputClass = classNames(
    type === 'file' ? fileInputClass : otherInputClass,
    className
  )

  const attributes = {
    type,
    ...register(name, registerOptions),
    id: name,
    'aria-describedby': `${name}Feedback`,
    ...props,
  }

  return addOn ? (
    <div
      data-testid="container"
      className={
        border +
        ' flex flex-row flex-nowrap items-center bg-fuchsia-50 border-b-2 transition-colors rounded'
      }
    >
      <input {...attributes} className={inputClass + ' rounded-l'} />
      <div className={classNames(addOnClass, 'pr-8')}>{addOn}</div>
    </div>
  ) : (
    <input
      {...attributes}
      className={`${inputClass} ${border} border-b-2 transition-colors rounded`}
    />
  )
}

export default Input
