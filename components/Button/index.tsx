import classNames from 'classnames'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const BUTTON_BASE =
  'rounded px-16 py-8 transition-colors duration-200 font-bold'

const BUTTON_COLORS = {
  primary:
    'bg-fuchsia-600 text-fuchsia-50 hover:bg-fuchsia-300 focus:bg-fuchsia-300 hover:text-fuchsia-900 focus:text-fuchsia-900 disabled:bg-fuchsia-800/70 disabled:text-fuchsia-50/80',
  secondary:
    'bg-fuchsia-300 text-fuchsia-900 hover:bg-fuchsia-400 focus:bg-fuchsia-400',
  danger: 'bg-rose-600 text-rose-50 hover:bg-rose-700 focus:bg-rose-700',
}

const NO_RADIUS = {
  left: 'rounded-l-none',
  right: 'rounded-r-none',
  top: 'rounded-t-none',
  bottom: 'rounded-b-none',
}

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode
  color: keyof typeof BUTTON_COLORS
  fullWidth?: boolean
  noRadius?: 'left' | 'right' | 'top' | 'bottom'
}

export default function Button({
  children,
  color,
  className,
  fullWidth,
  noRadius,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={classNames(
        BUTTON_BASE,
        BUTTON_COLORS[color],
        { 'w-full': fullWidth },
        noRadius && NO_RADIUS[noRadius]
      )}
    >
      {children}
    </button>
  )
}
