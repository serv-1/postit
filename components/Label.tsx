import classNames from 'classnames'
import { ComponentPropsWithoutRef } from 'react'

export interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  labelText: string
}

const Label = (props: LabelProps) => {
  const className = classNames('form-label', props.className)

  return (
    <label htmlFor={props.htmlFor} className={className}>
      {props.labelText}
    </label>
  )
}

export default Label
