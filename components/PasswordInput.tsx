import classNames from 'classnames'
import { ChangeEvent, ComponentPropsWithoutRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import zxcvbn from 'zxcvbn'
import Eye from '../public/static/images/eye-fill.svg'
import EyeSlash from '../public/static/images/eye-slash-fill.svg'
import Button from './Button'
import TextInput from './TextInput'

interface Strength {
  estimated_time: string | number
  color: string
}

export interface PasswordInputProps extends ComponentPropsWithoutRef<'input'> {
  needFocus?: boolean
  showStrength?: boolean
  hasRules?: boolean
}

const PasswordInput = ({
  showStrength,
  needFocus,
  hasRules,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState<Strength>()
  const { getValues } = useFormContext()
  const values = Object.values(getValues()).slice(0, -1)

  const ariaDescr = classNames('visibilityBtn passwordStrength', {
    passwordRules: hasRules,
  })

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { crack_times_display, score } = zxcvbn(e.target.value, values)

    let color = 'success'
    if (score <= 2) color = 'danger'
    else if (score === 3) color = 'warning'

    setStrength({
      estimated_time: crack_times_display.offline_slow_hashing_1e4_per_second,
      color,
    })
  }

  return (
    <>
      <Button
        type="button"
        id="visibilityBtn"
        className="btn-outline-secondary"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={(showPassword ? 'Hide' : 'Show') + ' password'}
      >
        {showPassword ? (
          <EyeSlash data-testid="closeEye" width="20" height="20" />
        ) : (
          <Eye data-testid="openEye" width="20" height="20" />
        )}
      </Button>
      <TextInput
        {...props}
        name="password"
        type={showPassword ? 'text' : 'password'}
        onChange={showStrength ? onPasswordChange : undefined}
        aria-describedby={ariaDescr}
        needFocus={needFocus}
      />
      {showStrength && strength && (
        <span
          className={`input-group-text text-white border-1 border-${strength.color} bg-${strength.color}`}
          id="passwordStrength"
          role="status"
        >
          Need {strength.estimated_time} to crack
        </span>
      )}
    </>
  )
}

export default PasswordInput
