import { createContext, useContext, useState } from 'react'

interface TabsContextValue {
  activeTab?: string
  setActiveTab: React.Dispatch<React.SetStateAction<string | undefined>>
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

interface TabsProviderProps {
  children: React.ReactNode
  defaultValue?: string
}

const TabsProvider = ({ children, defaultValue }: TabsProviderProps) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(defaultValue)

  const value = { activeTab, setActiveTab }
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

const useTabs = () => {
  const context = useContext(TabsContext)

  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider')
  }

  return context
}

export { TabsProvider, useTabs }
