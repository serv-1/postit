import { ChangeEvent, useState } from 'react'
import { FieldError, UseFormRegister } from 'react-hook-form'
const zxcvbn = require('zxcvbn')

type Props = {
  labelName: string
  rules: boolean
  showBtn: boolean
  strength: boolean
  name: string
  isFormSubmitted: boolean
  error?: FieldError
  register: UseFormRegister<any>
}

type PasswordStrength = {
  estimated_time: string
  score: number
}

const PasswordInput = (props: Props) => {
  const {
    labelName,
    rules,
    showBtn,
    strength,
    name,
    isFormSubmitted,
    error,
    register,
  } = props
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>()

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const result = zxcvbn(e.target.value)
    setPasswordStrength({
      estimated_time:
        result.crack_times_display.offline_slow_hashing_1e4_per_second,
      score: result.score,
    })
  }

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
            {showPassword ? 'hide' : 'show'}
          </button>
        )}
        <input
          {...register(name)}
          onChange={onPasswordChange}
          type={showPassword ? 'text' : 'password'}
          id={name}
          className={`form-control ${
            isFormSubmitted && (error ? 'is-invalid' : 'is-valid')
          }`}
          aria-describedby={`${pwFeedbackId} ${pwRulesId} ${pwStrengthId} visibilityBtn`}
        />
        {strength && passwordStrength && (
          <span
            className={`input-group-text text-white ${
              passwordStrength.score <= 2
                ? 'bg-danger'
                : passwordStrength.score === 3
                ? 'bg-warning'
                : 'bg-success'
            }`}
            id={pwStrengthId}
            role="status"
          >
            Need {passwordStrength.estimated_time} to crack
          </span>
        )}
      </div>
      {isFormSubmitted && error && (
        <div className="invalid-feedback" id={pwFeedbackId} role="alert">
          {error.message}
        </div>
      )}
    </div>
  )
}

export default PasswordInput
