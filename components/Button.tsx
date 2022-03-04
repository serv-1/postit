import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  needDefaultClassNames?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { needDefaultClassNames = true, className, children, ...rest } = props

  const _className = classNames(
    {
      'bg-indigo-600 text-white px-8 py-4 rounded': needDefaultClassNames,
    },
    className
  )

  return (
    <button {...rest} className={_className} ref={ref}>
      {children}
    </button>
  )
})

export default Button
