import InputError from './InputError'
import Label from './Label'
import Link from 'next/link'
import PasswordInput from './PasswordInput'

export interface FormPasswordFieldProps {
  showForgotPasswordLink?: boolean
  showStrength?: boolean
  showRules?: boolean
  needFocus?: boolean
}

const FormPasswordField = ({
  showForgotPasswordLink,
  showStrength,
  showRules,
  needFocus,
}: FormPasswordFieldProps) => (
  <div className="mb-3 text-start">
    <Label htmlFor="password" labelText="Password" />
    {showRules && (
      <div className="form-text m-0 mb-1" id="passwordRules" role="note">
        It must be 10-20 characters long. It must not equal the others
        fields&apos; value. There is no characters restriction so you can use
        emojis, cyrillic, etc.
      </div>
    )}
    <div className="input-group">
      <PasswordInput
        showStrength={showStrength}
        needFocus={needFocus}
        hasRules
      />
      <InputError inputName="password" />
    </div>
    {showForgotPasswordLink && (
      <Link href="/auth/forgot-password">
        <a className="form-text d-block text-decoration-none text-dark text-end">
          Forgot password?
        </a>
      </Link>
    )}
  </div>
)

export default FormPasswordField
