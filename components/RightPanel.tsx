import classNames from 'classnames'

interface RightPanelProps {
  children?: React.ReactNode
  errorPage?: boolean
}

const RightPanel = ({ children, errorPage }: RightPanelProps) => {
  return (
    <div
      className={classNames(
        'hidden md:basis-1/2 md:flex md:items-center',
        errorPage
          ? 'md:bg-fuchsia-900 md:pl-8'
          : 'md:bg-linear-wrapper md:justify-center'
      )}
    >
      {children}
    </div>
  )
}

export default RightPanel
