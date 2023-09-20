import { type ChangeEvent, type ReactNode, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import zxcvbn from 'zxcvbn'

type StrengthState = 'weak' | 'average' | 'strong'

interface PasswordStrengthProps {
  children: (onChange: (e: ChangeEvent<HTMLInputElement>) => void) => ReactNode
  className?: string
}

export default function PasswordStrength({
  children,
  className,
}: PasswordStrengthProps) {
  const [strength, setStrength] = useState<StrengthState>('weak')
  const { getValues } = useFormContext()

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const userInputs = Object.values(
      Object.keys(getValues()).filter((key) => key !== 'password')
    )

    const { score } = zxcvbn(e.target.value, userInputs)

    if (score <= 2) {
      setStrength('weak')
    } else if (score === 3) {
      setStrength('average')
    } else {
      setStrength('strong')
    }
  }

  return (
    <>
      <div id="passwordStrength" role="status" className={className}>
        <span className="sr-only">Your password is </span>
        <span className="font-bold text-fuchsia-500 text-s">{strength}</span>
      </div>
      {children(onChange)}
    </>
  )
}
