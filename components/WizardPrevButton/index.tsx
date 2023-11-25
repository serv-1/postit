'use client'

import useWizard from 'hooks/useWizard'

interface WizardPrevButtonProps {
  children: React.ReactNode
  className?: string
}

export default function WizardPrevButton({
  children,
  className,
}: WizardPrevButtonProps) {
  const { prevStep, activeStepId, firstStepId } = useWizard()

  return (
    <button
      type="button"
      className={className}
      onClick={prevStep}
      disabled={activeStepId === firstStepId}
    >
      {children}
    </button>
  )
}
