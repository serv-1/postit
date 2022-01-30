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
    'form-control',
    isSubmitted && (errors[name] ? 'is-invalid' : 'is-valid'),
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
