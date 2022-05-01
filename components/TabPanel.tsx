import { useTabs } from '../contexts/tabs'

type OmittedDivProps = 'role' | 'tabIndex' | 'id' | 'aria-labelledby'
type DivProps = Omit<React.ComponentPropsWithoutRef<'div'>, OmittedDivProps>

interface TabPanelProps extends DivProps {
  value: string
}

const TabPanel = ({ children, value, ...props }: TabPanelProps) => {
  const { activeTab } = useTabs()

  return value === activeTab ? (
    <div
      {...props}
      role="tabpanel"
      tabIndex={0}
      id={value + '-panel'}
      aria-labelledby={value + '-tab'}
    >
      {children}
    </div>
  ) : null
}

export default TabPanel
