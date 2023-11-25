'use client'

import useWizard from 'hooks/useWizard'
import { nanoid } from 'nanoid'
import { useEffect, useRef } from 'react'

interface WizardStepProps {
  children: React.ReactNode
  className: string
}

export default function WizardStep({ children, className }: WizardStepProps) {
  const { activeStepId, addStep, removeStep } = useWizard()

  const id = useRef<string | null>(null)

  function getId() {
    return id.current || (id.current = nanoid())
  }

  useEffect(() => {
    addStep(getId())

    return () => {
      removeStep(getId())
    }
  }, [addStep, removeStep])

  return (
    <div className={activeStepId === getId() ? className : 'hidden'}>
      {children}
    </div>
  )
}
