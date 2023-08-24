import classNames from 'classnames'

interface GlassWrapperProps {
  children: React.ReactNode
  minHeight?: string
  padding?: string
}

export default function GlassWrapper({
  children,
  minHeight,
  padding,
}: GlassWrapperProps) {
  return (
    <div
      className={classNames(
        'w-full max-w-[450px] rounded-16 overflow-hidden bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-wrapper md:max-w-full md:bg-linear-wrapper md:flex md:flex-row md:flex-nowrap',
        minHeight,
        padding || 'p-32 md:p-0'
      )}
    >
      {children}
    </div>
  )
}
