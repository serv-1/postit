import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  needDefaultClassNames?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { needDefaultClassNames = true, className, children, ...rest } = props

  const _className = classNames(
    {
      'bg-indigo-600 hover:bg-indigo-800 transition-colors duration-200 text-white px-8 py-4 rounded':
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
