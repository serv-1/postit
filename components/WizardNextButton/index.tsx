'use client'

import useWizard from 'hooks/useWizard'

interface WizardNextButtonProps {
  children: React.ReactNode
  className?: string
  isDisabled?: boolean
}

export default function WizardNextButton({
  children,
  className,
  isDisabled,
}: WizardNextButtonProps) {
  const { nextStep, activeStepId, lastStepId } = useWizard()

  return (
    <button
      type="button"
      className={className}
      onClick={nextStep}
      disabled={activeStepId === lastStepId || isDisabled}
    >
      {children}
    </button>
  )
}
