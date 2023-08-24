import classNames from 'classnames'
import { useTabs } from 'contexts/tabs'

interface TabPanelProps
  extends Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'role' | 'tabIndex' | 'id' | 'aria-labelledby'
  > {
  value: string
}

export default function TabPanel({
  children,
  value,
  className,
  ...props
}: TabPanelProps) {
  const { activeTab } = useTabs()

  return (
    <div
      {...props}
      className={classNames(
        className,
        value === activeTab ? 'block' : 'hidden'
      )}
      role="tabpanel"
      tabIndex={0}
      id={value + '-panel'}
      aria-labelledby={value + '-tab'}
    >
      {children}
    </div>
  )
}
