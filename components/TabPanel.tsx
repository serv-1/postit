import classNames from 'classnames'
import { useTabs } from 'contexts/tabs'

type OmittedDivProps = 'role' | 'tabIndex' | 'id' | 'aria-labelledby'
type DivProps = Omit<React.ComponentPropsWithoutRef<'div'>, OmittedDivProps>

interface TabPanelProps extends DivProps {
  value: string
}

const TabPanel = ({ children, value, className, ...props }: TabPanelProps) => {
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

export default TabPanel
