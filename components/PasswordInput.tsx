import { ChangeEvent, useEffect, useState } from 'react'
import { FieldError, UseFormRegister, UseFormSetFocus } from 'react-hook-form'
const zxcvbn = require('zxcvbn')
import Link from 'next/link'
import Eye from '../public/static/images/eye-fill.svg'
import EyeSlash from '../public/static/images/eye-slash-fill.svg'

type Props = {
  labelName: string
  rules?: boolean
  showBtn?: boolean
  strength?: boolean
  forgotPassword?: boolean
  name: string
  isFormSubmitted: boolean
  error?: FieldError
  register: UseFormRegister<any>
  setFocus?: UseFormSetFocus<any>
}

type PasswordStrength = {
  estimated_time: string
  color: string
}

const PasswordInput = ({
  labelName,
  rules,
  showBtn,
  strength,
  forgotPassword,
  name,
  isFormSubmitted,
  error,
  register,
  setFocus,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>()

  useEffect(() => {
    if (!setFocus) return
    setFocus(name)
  }, [setFocus, name])

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { crack_times_display, score } = zxcvbn(e.target.value)
    let c = 'success'
    if (score <= 2) c = 'danger'
    else if (score === 3) c = 'warning'
    setPasswordStrength({
      estimated_time: crack_times_display.offline_slow_hashing_1e4_per_second,
      color: c,
    })
  }

  const inputClass = isFormSubmitted && (error ? 'is-invalid' : 'is-valid')
  const pwFeedbackId = name + 'Feedback'
  const pwStrengthId = name + 'Strength'
  const pwRulesId = name + 'Rules'

  return (
    <div className="mb-3 text-start">
      <label htmlFor={name} className="form-label">
        {labelName}
      </label>
      {rules && (
        <div className="form-text m-0" id={pwRulesId} role="note">
          Your password must be 10-20 characters long. It must not equal the
          email. There is no characters restriction so you can use emojis,
          cyrillic, etc. 😎
        </div>
      )}
      <div className="input-group">
        {showBtn && (
          <button
            id="visibilityBtn"
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye width="20" height="20" aria-label="Hide password" />
            ) : (
              <EyeSlash width="20" height="20" aria-label="Show password" />
            )}
          </button>
        )}
        <input
          {...register(name)}
          onChange={onPasswordChange}
          type={showPassword ? 'text' : 'password'}
          id={name}
          className={`form-control ${inputClass || ''}`}
          aria-describedby={`${pwFeedbackId} ${pwRulesId} ${pwStrengthId} visibilityBtn`}
        />
        {strength && passwordStrength && (
          <span
            className={`input-group-text text-white border-1 border-${passwordStrength.color} bg-${passwordStrength.color}`}
            id={pwStrengthId}
            role="status"
          >
            Need {passwordStrength.estimated_time} to crack
          </span>
        )}
        {isFormSubmitted && error && (
          <div className="invalid-feedback" id={pwFeedbackId} role="alert">
            {error.message}
          </div>
        )}
      </div>
      {forgotPassword && (
        <Link href="/auth/forgot-password">
          <a className="form-text d-block text-decoration-none text-dark text-end">
            Forgot password?
          </a>
        </Link>
      )}
    </div>
  )
}

export default PasswordInput
