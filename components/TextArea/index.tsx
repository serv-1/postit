import classNames from 'classnames'
import { useEffect } from 'react'
import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form'

interface TextAreaProps<FormFields extends FieldValues>
  extends Omit<
    React.ComponentPropsWithoutRef<'textarea'>,
    'id' | 'className' | 'aria-describedby'
  > {
  name: FieldPath<FormFields>
  registerOptions?: RegisterOptions<FormFields>
  needFocus?: boolean
}

export default function TextArea<FormFields extends FieldValues>({
  name,
  registerOptions,
  needFocus,
  ...props
}: TextAreaProps<FormFields>) {
  const { register, setFocus, formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState

  useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  return (
    <textarea
      {...props}
      {...register(name, registerOptions)}
      id={name}
      aria-describedby={`${name}Feedback`}
      className={classNames(
        'rounded p-8 w-full bg-fuchsia-50 border-b-2 outline-none align-bottom transition-colors placeholder:text-[rgba(112,26,117,0.5)]',
        isSubmitted && errors[name]
          ? 'border-2 border-rose-600 focus-within:border-rose-900'
          : 'border-fuchsia-900/25 focus-within:border-fuchsia-900/75'
      )}
    ></textarea>
  )
}
