import { useRouter } from 'next/router'
import { ChangeEvent, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import zxcvbn from 'zxcvbn'
import Eye from '../public/static/images/eye-fill.svg'
import EyeSlash from '../public/static/images/eye-slash-fill.svg'
import Input from './Input'
import InputError from './InputError'
import Link from './Link'

type StrengthState = 'weak' | 'average' | 'strong'

interface PasswordFieldWithStrength {
  showStrength: true
  showForgotLink?: false
}

interface PasswordFieldWithForgotLink {
  showStrength?: false
  showForgotLink: true
}

type PasswordFieldProps = (
  | PasswordFieldWithStrength
  | PasswordFieldWithForgotLink
) & { needFocus?: boolean; inputClass?: string; containerClass?: string }

const PasswordField = <
  FormFields extends { password: string } = { password: string }
>({
  showForgotLink,
  showStrength,
  needFocus,
  inputClass,
  containerClass,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState<StrengthState>('weak')
  const { getValues } = useFormContext<FormFields>()
  const { pathname } = useRouter()

  const onChange = showStrength
    ? (e: ChangeEvent<HTMLInputElement>) => {
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
    : undefined

  return (
    <div className="mb-16">
      <div className="flex flex-row flex-nowrap justify-between items-baseline">
        <label htmlFor="password">Password</label>
        {(showForgotLink &&
          (pathname === '/authentication' ? (
            <a
              href={'#forgot-password'}
              className="text-fuchsia-700 hover:underline text-s"
              onClick={(e) => {
                e.preventDefault()
                window.location.hash = 'forgot-password'
                window.dispatchEvent(new CustomEvent('onHashChange'))
              }}
            >
              Forgot password?
            </a>
          ) : (
            <Link
              href="/authentication#forgot-password"
              className="text-fuchsia-700 text-s"
            >
              Forgot password?
            </Link>
          ))) ||
          (showStrength && (
            <div id="passwordStrength" role="status">
              <span className="sr-only">Your password is </span>
              <span className="font-bold text-fuchsia-500 text-s">
                {strength}
              </span>
            </div>
          ))}
      </div>
      <Input<{ password: string }>
        name="password"
        type={showPassword ? 'text' : 'password'}
        registerOptions={{ onChange }}
        aria-describedby="passwordStrength"
        needFocus={needFocus}
        className={inputClass}
        containerClass={containerClass}
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
      <InputError<{ password: string }> inputName="password" />
    </div>
  )
}

export default PasswordField
