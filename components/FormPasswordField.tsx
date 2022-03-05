import InputError from './InputError'
import Label from './Label'
import PasswordInput from './PasswordInput'

export interface FormPasswordFieldProps {
  showStrength?: boolean
  showRules?: boolean
  needFocus?: boolean
}

const FormPasswordField = ({
  showStrength,
  showRules,
  needFocus,
}: FormPasswordFieldProps) => (
  <div className="mb-16">
    <Label htmlFor="password" labelText="Password" />
    {showRules && (
      <div className="text-xs mb-4" id="passwordRules" role="note">
        It must be 10-20 characters long. It must not equal the others
        fields&apos; value. There is no characters restriction so you can use
        emojis, cyrillic, etc.
      </div>
    )}
    <PasswordInput
      showStrength={showStrength}
      needFocus={needFocus}
      hasRules
      className="mb-4"
    />
    <InputError inputName="password" />
  </div>
)

export default FormPasswordField
