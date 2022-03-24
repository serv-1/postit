import classNames from 'classnames'
import React from 'react'
import {
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form'

interface InputProps<FormFields extends FieldValues = FieldValues>
  extends React.ComponentPropsWithoutRef<'input'> {
  name: FieldPath<FormFields>
  registerOptions?: RegisterOptions<FormFields>
  type: 'text' | 'email' | 'number' | 'file' | 'password' | 'search'
  needFocus?: boolean
  isTextArea?: false
}

interface TextAreaProps<FormFields extends FieldValues = FieldValues>
  extends React.ComponentPropsWithoutRef<'textarea'> {
  name: FieldPath<FormFields>
  registerOptions?: RegisterOptions<FormFields>
  type?: undefined
  needFocus?: boolean
  isTextArea: true
}

const Input = <FormFields extends FieldValues = FieldValues>({
  name,
  registerOptions,
  needFocus,
  className,
  ...props
}: InputProps<FormFields> | TextAreaProps<FormFields>) => {
  const { isTextArea, type } = props

  const { register, setFocus, formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState

  const _className = classNames(
    'border rounded p-4 w-full align-top',
    {
      'file:border-none file:py-4 file:px-8 file:mr-8 p-0': type === 'file',
    },
    isSubmitted && errors[name]
      ? 'border-red-600' + (type === 'file' ? ' file:bg-red-200' : '')
      : 'border-indigo-600' + (type === 'file' ? ' file:bg-indigo-200' : ''),
    className
  )

  React.useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  const attributes = {
    ...register(name, registerOptions),
    className: _className,
    id: name,
    'aria-describedby': name + 'Feedback',
  }

  delete props.isTextArea

  return isTextArea ? (
    <textarea {...props} {...attributes}></textarea>
  ) : (
    <input {...props} {...attributes} />
  )
}

export default Input
