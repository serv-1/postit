import TabsContext from 'contexts/tabs'
import { useContext } from 'react'

export default function useTabs() {
  const context = useContext(TabsContext)

  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider')
  }

  return context
}
