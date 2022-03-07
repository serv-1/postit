import InputError from './InputError'
import Label from './Label'
import PasswordInput from './PasswordInput'

export interface FormPasswordFieldProps {
  showStrength?: boolean
  showRules?: boolean
  needFocus?: boolean
  labelText?: string
  inputName?: string
}

const FormPasswordField = ({
  showStrength,
  showRules,
  needFocus,
  labelText = 'Password',
  inputName = 'password',
}: FormPasswordFieldProps) => (
  <div className="mb-16">
    <Label htmlFor={inputName} labelText={labelText} />
    {showRules && (
      <div className="text-s mb-4" id="passwordRules" role="note">
        It must be 10-20 characters long. It must not equal the others
        fields&apos; value. There is no characters restriction so you can use
        emojis, cyrillic, etc.
      </div>
    )}
    <PasswordInput showStrength={showStrength} needFocus={needFocus} hasRules />
    <InputError inputName={inputName} />
  </div>
)

export default FormPasswordField
