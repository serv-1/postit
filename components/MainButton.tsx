import { ComponentPropsWithoutRef, forwardRef } from 'react'
import classNames from 'classnames'

export interface Color {
  base?: string
  states?: string | false
}

interface MainButtonProps extends ComponentPropsWithoutRef<'button'> {
  bgColor?: Color
  textColor?: Color
  radius?: string
  padding?: string
}

const MainButton = forwardRef<HTMLButtonElement, MainButtonProps>(
  (
    { className, children, bgColor, textColor, radius, padding, ...rest },
    ref
  ) => (
    <button
      {...rest}
      ref={ref}
      className={classNames(
        bgColor?.base || 'bg-fuchsia-600',
        bgColor?.states ||
          bgColor?.states === false ||
          'hover:bg-fuchsia-300 focus:bg-fuchsia-300',
        textColor?.base || 'text-fuchsia-50',
        textColor?.states ||
          textColor?.states === false ||
          'hover:text-fuchsia-900 focus:text-fuchsia-900',
        radius || 'rounded',
        padding || 'px-16 py-8',
        'transition-colors duration-200 font-bold',
        className
      )}
    >
      {children}
    </button>
  )
)

MainButton.displayName = 'MainButton'

export default MainButton
