interface DotButtonProps
  extends Omit<
    React.ComponentPropsWithoutRef<'button'>,
    'style' | 'className'
  > {
  style: 'arrowLeft' | 'heart' | 'camera' | 'x' | 'chat'
}

const BASE =
  'rounded-full p-8 w-48 h-48 shadow-[0_2px_8px_rgba(112,26,117,0.25)] transition-colors duration-200 '
const COLOR = 'bg-fuchsia-50 text-fuchsia-600 '
const STATES = 'hover:bg-fuchsia-900 hover:text-fuchsia-50 '

const styles = {
  arrowLeft: 'absolute top-8 left-8 md:hidden',
  heart: 'absolute top-8 right-8 group',
  camera: 'absolute bottom-8 right-8',
  x: 'absolute top-8 right-8 z-20 md:static md:shadow-none md:self-end md:mb-16',
  chat: 'bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-300 fixed bottom-8 right-8 md:hidden',
}

const DotButton = ({ children, style, ...props }: DotButtonProps) => {
  let classes = BASE

  switch (style) {
    case 'heart':
      classes += COLOR + styles[style]
      break
    case 'chat':
      classes += styles[style]
      break
    default:
      classes += COLOR + STATES + styles[style]
  }

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  )
}

export default DotButton
