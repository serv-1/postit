import { createContext } from 'react'

interface WizardContextValue {
  activeStepId: string
  firstStepId: string
  lastStepId: string
  addStep: (id: string) => void
  removeStep: (id: string) => void
  prevStep: () => void
  nextStep: () => void
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined)

export default WizardContext
