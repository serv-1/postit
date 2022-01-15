import { ComponentPropsWithoutRef } from 'react'
import classNames from 'classnames'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  gradient?: boolean
}

const Button = ({
  className,
  type,
  children,
  gradient,
  ...props
}: ButtonProps) => {
  const _className = classNames('btn', className, {
    'bg-gradient': gradient,
  })

  return (
    <button {...props} type={type || 'button'} className={_className}>
      {children}
    </button>
  )
}

export default Button
