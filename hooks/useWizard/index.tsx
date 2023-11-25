import WizardContext from 'contexts/wizard'
import { useContext } from 'react'

export default function useWizard() {
  const context = useContext(WizardContext)

  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }

  return context
}
