import { ComponentPropsWithoutRef } from 'react'

export interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  labelText: string
}

const Label = ({ htmlFor, labelText, ...props }: LabelProps) => {
  return (
    <label htmlFor={htmlFor} {...props}>
      {labelText}
    </label>
  )
}

export default Label
