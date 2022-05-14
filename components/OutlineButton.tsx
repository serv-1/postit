import classNames from 'classnames'

interface OutlineButtonProps extends React.ComponentPropsWithoutRef<'button'> {}

const OutlineButton = ({ children, ...props }: OutlineButtonProps) => {
  return (
    <button
      {...props}
      className={classNames(
        'hover:bg-fuchsia-600 focus:bg-fuchsia-600 text-fuchsia-600 hover:text-fuchsia-50 focus:text-fuchsia-50 border-2 border-fuchsia-600 mr-8 px-8 py-4 rounded-full transition-colors duration-200 font-bold'
      )}
    >
      {children}
    </button>
  )
}

export default OutlineButton
