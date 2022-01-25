import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  FocusEventHandler,
} from 'react'
import Input from './Input'
import InputError from './InputError'
import Label from './Label'

interface FormFieldProps {
  labelText: string
  inputName: string
  needFocus?: boolean
}

type TextareaHtmlProps = ComponentPropsWithoutRef<'textarea'>
type InputHtmlProps = ComponentPropsWithoutRef<'input'>

interface TextareaProps extends FormFieldProps, TextareaHtmlProps {
  isTextArea: true
  onChange?: ChangeEventHandler<HTMLTextAreaElement>
  onBlur?: FocusEventHandler<HTMLTextAreaElement>
}

interface InputProps extends FormFieldProps, InputHtmlProps {
  type: 'text' | 'email' | 'number' | 'file' | 'password'
  isTextArea?: false
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
}

const FormField = ({
  labelText,
  inputName,
  ...props
}: TextareaProps | InputProps) => (
  <div className="mb-3 text-start">
    <Label htmlFor={inputName} labelText={labelText} />
    <Input
      name={inputName}
      aria-describedby={`${inputName}Feedback`}
      {...props}
    />
    <InputError inputName={inputName} />
  </div>
)

export default FormField
