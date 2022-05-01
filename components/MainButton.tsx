import { ComponentPropsWithoutRef, forwardRef } from 'react'
import classNames from 'classnames'

interface MainButtonProps extends ComponentPropsWithoutRef<'button'> {}

const MainButton = forwardRef<HTMLButtonElement, MainButtonProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <button
        {...rest}
        ref={ref}
        className={classNames(
          'bg-fuchsia-600 text-fuchsia-50 hover:bg-fuchsia-200 hover:text-fuchsia-900 active:bg-fuchsia-900 active:text-fuchsia-200 transition-colors px-16 py-8 rounded font-bold',
          className
        )}
      >
        {children}
      </button>
    )
  }
)

MainButton.displayName = 'MainButton'

export default MainButton
