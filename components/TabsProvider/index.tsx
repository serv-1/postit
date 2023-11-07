import TabsContext from 'contexts/tabs'
import { useState } from 'react'

interface TabsProviderProps {
  children: React.ReactNode
  defaultValue?: string
}

export default function TabsProvider({
  children,
  defaultValue,
}: TabsProviderProps) {
  const [activeTab, setActiveTab] = useState<string | undefined>(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}
