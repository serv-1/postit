import classNames from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import Button from './Button'

export interface CloseButtonProps extends ComponentPropsWithoutRef<'button'> {
  isWhite?: boolean
}

const CloseButton = ({ isWhite, className, ...props }: CloseButtonProps) => {
  const _className = classNames(
    'btn-close',
    { 'btn-close-white': isWhite },
    className
  )

  return <Button {...props} aria-label="Close" className={_className}></Button>
}

export default CloseButton
