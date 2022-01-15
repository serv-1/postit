import classNames from 'classnames'
import React from 'react'
import { useFormContext } from 'react-hook-form'

interface TextInputProps extends React.ComponentPropsWithRef<'input'> {
  name: string
  needFocus?: boolean
}

const TextInput = ({
  name,
  onBlur,
  onChange,
  needFocus,
  className,
  ...props
}: TextInputProps) => {
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

  return (
    <input
      {...props}
      {...register(name, { onBlur, onChange })}
      className={_className}
      id={name}
    />
  )
}

export default TextInput
