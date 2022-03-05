import classNames from 'classnames'
import { ChangeEvent, ComponentPropsWithoutRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import zxcvbn from 'zxcvbn'
import Eye from '../public/static/images/eye-fill.svg'
import EyeSlash from '../public/static/images/eye-slash-fill.svg'
import Button from './Button'
import Input from './Input'

interface Strength {
  text: 'weak' | 'good but not strong' | 'strong'
  color: 'red' | 'yellow' | 'green'
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
  className,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const defaultStrength = { text: 'weak' as const, color: 'red' as const }
  const [strength, setStrength] = useState<Strength>(defaultStrength)
  const { getValues, formState } = useFormContext()
  const { isSubmitted, errors } = formState
  const userInputs = getValues()
  delete userInputs.password

  const ariaDescr = classNames('passwordStrength', { passwordRules: hasRules })

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { score } = zxcvbn(e.target.value, Object.values(userInputs))

    if (score <= 2) {
      return setStrength({ text: 'weak', color: 'red' })
    } else if (score === 3) {
      return setStrength({ text: 'good but not strong', color: 'yellow' })
    }

    setStrength({ text: 'strong', color: 'green' })
  }

  const containerClass = classNames(
    'border rounded',
    isSubmitted
      ? errors.password
        ? 'border-red-600'
        : 'border-indigo-600'
      : 'border-indigo-600',
    className
  )

  return (
    <div data-testid="container" className={containerClass}>
      <div className="flex">
        <Input
          {...props}
          name="password"
          type={showPassword ? 'text' : 'password'}
          onChange={showStrength ? onPasswordChange : undefined}
          aria-describedby={ariaDescr}
          needFocus={needFocus}
          className="border-0"
        />
        <Button
          needDefaultClassNames={false}
          className="px-4 text-indigo-600"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={(showPassword ? 'Hide' : 'Show') + ' password'}
        >
          {showPassword ? (
            <EyeSlash data-testid="closeEye" width="20" height="20" />
          ) : (
            <Eye data-testid="openEye" width="20" height="20" />
          )}
        </Button>
      </div>
      {showStrength && (
        <div className="flex bg-green-500" role="status">
          <div
            data-testid="red"
            className={
              'h-4 flex-grow ' +
              (strength.color === 'red' ? 'bg-red-500' : 'bg-red-700')
            }
          ></div>
          <div
            data-testid="yellow"
            className={
              'h-4 flex-grow ' +
              (strength.color === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-700')
            }
          ></div>
          <div
            data-testid="green"
            className={
              'h-4 flex-grow ' +
              (strength.color === 'green' ? 'bg-green-500' : 'bg-green-700')
            }
          ></div>
          <span id="passwordStrength" className="sr-only">
            Your password is {strength.text}.
          </span>
        </div>
      )}
    </div>
  )
}

export default PasswordInput
