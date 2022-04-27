import { ComponentPropsWithoutRef } from 'react'
import classNames from 'classnames'

interface MainButtonProps extends ComponentPropsWithoutRef<'button'> {}

const MainButton = ({ className, children, ...rest }: MainButtonProps) => {
  return (
    <button
      {...rest}
      className={classNames(
        'bg-fuchsia-600 text-fuchsia-50 hover:bg-fuchsia-200 hover:text-fuchsia-900 active:bg-fuchsia-900 active:text-fuchsia-200 transition-colors px-16 py-8 rounded font-bold',
        className
      )}
    >
      {children}
    </button>
  )
}

export default MainButton
