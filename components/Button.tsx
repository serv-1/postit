import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  needDefaultClassNames?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { needDefaultClassNames = true, className, children, ...rest } = props

  const _className = classNames(
    {
      'bg-fuchsia-600 text-fuchsia-50 hover:bg-fuchsia-200 hover:text-fuchsia-900 active:bg-fuchsia-900 active:text-fuchsia-200 transition-colors px-16 py-8 rounded font-bold':
        needDefaultClassNames,
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
