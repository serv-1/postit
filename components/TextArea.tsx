import classNames from 'classnames'
import { useEffect } from 'react'
import {
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form'

interface TextAreaProps<FormFields extends FieldValues>
  extends React.ComponentPropsWithoutRef<'textarea'> {
  name: FieldPath<FormFields>
  registerOptions?: RegisterOptions<FormFields>
  needFocus?: boolean
}

const TextArea = <FormFields extends FieldValues>({
  name,
  registerOptions,
  needFocus,
  className,
  ...props
}: TextAreaProps<FormFields>) => {
  const { register, setFocus, formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState

  const _className = classNames(
    'rounded p-8 w-full bg-fuchsia-100 border-b-2 outline-none transition-colors placeholder:text-[rgba(112,26,117,0.5)]',
    isSubmitted && errors[name]
      ? 'border-2 border-red-600 focus:border-red-900'
      : 'border-[rgba(112,26,117,0.25)] focus:border-[rgba(112,26,117,0.75)]',
    className
  )

  useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  return (
    <textarea
      {...register(name, registerOptions)}
      className={_className}
      id={name}
      aria-describedby={`${name}Feedback`}
      {...props}
    ></textarea>
  )
}

export default TextArea
