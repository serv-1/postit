'use client'

import WizardContext from 'contexts/wizard'
import { useCallback, useState } from 'react'

interface WizardProviderProps {
  children: React.ReactNode
}

export default function WizardProvider({ children }: WizardProviderProps) {
  const [activeStepPosition, setActiveStepPosition] = useState(0)
  const [stepIds, setStepIds] = useState<string[]>([])

  const prevStep = useCallback(() => {
    setActiveStepPosition((pos) => pos && pos - 1)
  }, [])

  const nextStep = useCallback(() => {
    setActiveStepPosition((pos) => (pos === stepIds.length - 1 ? pos : pos + 1))
  }, [stepIds.length])

  const addStep = useCallback((id: string) => {
    setStepIds((ids) => [...ids, id])
  }, [])

  const removeStep = useCallback(
    (id: string) => {
      setStepIds((ids) => ids.filter((_id) => _id !== id))
      setActiveStepPosition((pos) =>
        pos === stepIds.length - 1 ? pos - 1 : pos
      )
    },
    [stepIds.length]
  )

  return (
    <WizardContext.Provider
      value={{
        activeStepId: stepIds[activeStepPosition],
        firstStepId: stepIds[0],
        lastStepId: stepIds[stepIds.length - 1],
        addStep,
        removeStep,
        prevStep,
        nextStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
