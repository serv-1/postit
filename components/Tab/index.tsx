import useTabs from 'hooks/useTabs'

interface TabProps {
  value: string
  baseClass?: string
  activeClass: string
  inactiveClass?: string
  children: React.ReactNode
}

export default function Tab({
  value,
  activeClass,
  inactiveClass,
  baseClass,
  children,
  ...rest
}: TabProps) {
  const { activeTab, setActiveTab } = useTabs()
  const isActiveTab = value === activeTab

  return (
    <button
      {...rest}
      role="tab"
      tabIndex={isActiveTab ? 0 : -1}
      aria-selected={isActiveTab}
      aria-controls={value + '-panel'}
      id={value + '-tab'}
      onClick={() => setActiveTab(value)}
      className={baseClass + ' ' + (isActiveTab ? activeClass : inactiveClass)}
    >
      {children}
    </button>
  )
}
