import { type ChangeEvent, useState } from 'react'
import { type FieldPath, useFormContext } from 'react-hook-form'
import Eye from 'public/static/images/eye-fill.svg'
import EyeSlash from 'public/static/images/eye-slash-fill.svg'
import Input from 'components/Input'
import zxcvbn from 'zxcvbn'

type StrengthState = 'weak' | 'average' | 'strong'

interface PasswordInputProps {
  id?: string
  needFocus?: boolean
  className?: string
  showStrength?: boolean
}

export default function PasswordInput<FormFields extends { password: string }>({
  id,
  needFocus,
  className,
  showStrength,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState<StrengthState>('weak')
  const { getValues } = useFormContext()

  const onChange = showStrength
    ? (e: ChangeEvent<HTMLInputElement>) => {
        const userInputs: string[] = []
        const values = getValues()

        for (const key in values) {
          if (key !== 'password') {
            userInputs.push(values[key])
          }
        }

        const { score } = zxcvbn(e.target.value, userInputs)

        if (score <= 2) {
          setStrength('weak')
        } else if (score === 3) {
          setStrength('average')
        } else {
          setStrength('strong')
        }
      }
    : undefined

  return (
    <div className="relative w-full">
      <Input<FormFields>
        id={id}
        name={'password' as FieldPath<FormFields>}
        type={showPassword ? 'text' : 'password'}
        registerOptions={{ onChange }}
        ariaDescribedBy={showStrength ? 'passwordStrength' : ''}
        needFocus={needFocus}
        className={className}
        addOn={
          <button
            className="text-fuchsia-700"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={(showPassword ? 'Hide' : 'Show') + ' password'}
          >
            {showPassword ? (
              <EyeSlash data-testid="eyeSlashIcon" width="20" height="20" />
            ) : (
              <Eye data-testid="eyeIcon" width="20" height="20" />
            )}
          </button>
        }
      />
      {showStrength && (
        <div
          id="passwordStrength"
          role="status"
          className="absolute top-0 right-0 -translate-y-full"
        >
          <span className="sr-only">Your password is </span>
          <span className="font-bold text-fuchsia-500 text-s">{strength}</span>
        </div>
      )}
    </div>
  )
}
