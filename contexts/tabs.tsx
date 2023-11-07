import { createContext } from 'react'

interface TabsContextValue {
  activeTab?: string
  setActiveTab: React.Dispatch<React.SetStateAction<string | undefined>>
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export default TabsContext
