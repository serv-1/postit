import classNames from 'classnames'
import { ChangeEvent, ComponentPropsWithoutRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import zxcvbn from 'zxcvbn'
import Eye from '../public/static/images/eye-fill.svg'
import EyeSlash from '../public/static/images/eye-slash-fill.svg'
import Button from './Button'
import Input from './Input'

interface Strength {
  text: string
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
  const defaultStrength = { text: 'weak', color: 'danger' }
  const [strength, setStrength] = useState<Strength>(defaultStrength)
  const { getValues, formState } = useFormContext()
  const { isSubmitted, errors } = formState
  const userInputs = getValues()
  delete userInputs.password

  const ariaDescr = classNames('passwordStrength', { passwordRules: hasRules })

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { score } = zxcvbn(e.target.value, Object.values(userInputs))

    if (score <= 2) {
      return setStrength({ text: 'weak', color: 'danger' })
    } else if (score === 3) {
      return setStrength({ text: 'good but not strong', color: 'warning' })
    }

    setStrength({ text: 'strong', color: 'success' })
  }

  const getClassNames = (color: 'danger' | 'warning' | 'success') => {
    return classNames('rounded-circle', {
      'me-2': color !== 'success',
      [`bg-${color}`]: strength?.color === color,
    })
  }

  const btnClass = classNames('text-secondary rounded-end border-start-0', {
    'border-danger': isSubmitted && errors.password,
    'border-success': isSubmitted && !errors.password,
  })

  return (
    <>
      <Input
        {...props}
        name="password"
        type={showPassword ? 'text' : 'password'}
        onChange={showStrength ? onPasswordChange : undefined}
        aria-describedby={ariaDescr}
        needFocus={needFocus}
        className="rounded-start border-end-0"
      />
      <Button
        type="button"
        className={btnClass}
        style={{ border: '1px solid #ced4da' }}
        onClick={() => setShowPassword(!showPassword)}
        aria-label={(showPassword ? 'Hide' : 'Show') + ' password'}
      >
        {showPassword ? (
          <EyeSlash data-testid="closeEye" width="20" height="20" />
        ) : (
          <Eye data-testid="openEye" width="20" height="20" />
        )}
      </Button>
      {showStrength && (
        <div className="input-group-text bg-white border-0" role="status">
          <div
            data-testid="redDot"
            className={getClassNames('danger')}
            style={{ width: 18, height: 18, backgroundColor: '#931a26' }}
          ></div>
          <div
            data-testid="yellowDot"
            className={getClassNames('warning')}
            style={{ width: 18, height: 18, backgroundColor: '#9e7700' }}
          ></div>
          <div
            data-testid="greenDot"
            className={getClassNames('success')}
            style={{ width: 18, height: 18, backgroundColor: '#115a38' }}
          ></div>
          <span id="passwordStrength" className="d-none">
            Your password is {strength.text}.
          </span>
        </div>
      )}
    </>
  )
}

export default PasswordInput
