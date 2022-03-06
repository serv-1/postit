import classNames from 'classnames'
import React from 'react'
import { useFormContext } from 'react-hook-form'

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  type: 'text' | 'email' | 'number' | 'file' | 'password' | 'search'
  name: string
  needFocus?: boolean
  isTextArea?: false
}

export interface TextAreaProps
  extends React.ComponentPropsWithoutRef<'textarea'> {
  type?: undefined
  name: string
  needFocus?: boolean
  isTextArea: true
}

function Input({
  name,
  onBlur,
  onChange,
  needFocus,
  className,
  ...props
}: InputProps | TextAreaProps) {
  const { register, setFocus, formState } = useFormContext()
  const { isSubmitted, errors } = formState

  const _className = classNames(
    'border rounded p-4 w-full align-top',
    {
      'file:border-none file:py-4 file:px-8 file:mr-8 p-0':
        props.type === 'file',
    },
    isSubmitted
      ? errors[name]
        ? 'border-red-600' + (props.type === 'file' ? ' file:bg-red-200' : '')
        : 'border-indigo-600' +
          (props.type === 'file' ? ' file:bg-indigo-200' : '')
      : 'border-indigo-600' +
          (props.type === 'file' ? ' file:bg-indigo-200' : ''),
    className
  )

  React.useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  const attributes = {
    ...register(name, { onBlur, onChange }),
    className: _className,
    id: name,
  }

  const { isTextArea } = props
  delete props.isTextArea

  return isTextArea ? (
    <textarea {...props} {...attributes}></textarea>
  ) : (
    <input {...props} {...attributes} />
  )
}

export default Input
