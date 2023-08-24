import classNames from 'classnames'

interface LeftPanelProps {
  children: React.ReactNode
  padding?: string
}

export default function LeftPanel({ children, padding }: LeftPanelProps) {
  return (
    <div
      className={classNames(
        'h-full md:w-1/2 md:bg-fuchsia-50',
        padding || 'md:p-32'
      )}
    >
      {children}
    </div>
  )
}
