import { ChangeEventHandler } from 'react'
import TextInput from './TextInput'
import InputError from './InputError'
import Label from './Label'

export interface FormTextFieldProps {
  labelText: string
  inputName: string
  type: 'text' | 'email'
  onChange?: ChangeEventHandler<HTMLInputElement>
  needFocus?: boolean
}

const FormTextField = ({
  labelText,
  inputName,
  type,
  onChange,
  needFocus,
}: FormTextFieldProps) => (
  <div className="mb-3 text-start">
    <Label htmlFor={inputName} labelText={labelText} />
    <TextInput
      name={inputName}
      type={type}
      aria-describedby={`${inputName}Feedback`}
      onChange={onChange}
      needFocus={needFocus}
    />
    <InputError inputName={inputName} />
  </div>
)

export default FormTextField
