import classNames from 'classnames'

const BASE =
  'bg-fuchsia-50 text-fuchsia-600 rounded-full shadow-[0_2px_8px_rgba(112,26,117,0.25)] transition-colors duration-200'
const STATES = 'hover:bg-fuchsia-900 hover:text-fuchsia-50 '

interface DotButtonProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'className'> {
  noStates?: boolean
  isSmall?: boolean
}

const DotButton = (props: DotButtonProps) => {
  const { children, noStates, isSmall, ...rest } = props
  return (
    <button
      {...rest}
      className={classNames(
        BASE,
        noStates || STATES,
        isSmall ? 'p-4 w-32 h-32' : 'p-8 w-48 h-48'
      )}
    >
      {children}
    </button>
  )
}

export default DotButton
