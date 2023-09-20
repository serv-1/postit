import { type ChangeEvent, useState } from 'react'
import type { FieldPath } from 'react-hook-form'
import Eye from 'public/static/images/eye-fill.svg'
import EyeSlash from 'public/static/images/eye-slash-fill.svg'
import Input from 'components/Input'

interface PasswordInputProps {
  id?: string
  needFocus?: boolean
  bgColor?: string
  noRightRadius?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function PasswordInput<FormFields extends { password: string }>({
  id,
  needFocus,
  bgColor,
  noRightRadius,
  onChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Input<FormFields>
      id={id}
      name={'password' as FieldPath<FormFields>}
      type={showPassword ? 'text' : 'password'}
      registerOptions={{ onChange }}
      aria-describedby="passwordStrength"
      needFocus={needFocus}
      noRightRadius={noRightRadius}
      bgColor={bgColor}
      addOnClass="flex justify-center items-center"
      addOn={
        <button
          className="text-fuchsia-700"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={(showPassword ? 'Hide' : 'Show') + ' password'}
        >
          {showPassword ? (
            <EyeSlash data-testid="closeEye" width="20" height="20" />
          ) : (
            <Eye data-testid="openEye" width="20" height="20" />
          )}
        </button>
      }
    />
  )
}
