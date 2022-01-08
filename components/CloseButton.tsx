import { MouseEventHandler } from 'react'
import Button from './Button'

export type CloseButtonProps = {
  isWhite?: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
  className?: string
}

const CloseButton = ({
  isWhite = false,
  onClick,
  className,
}: CloseButtonProps) => {
  let _class = 'btn-close'

  if (isWhite) _class += ' btn-close-white'
  if (className) _class += ' ' + className

  return (
    <Button ariaLabel="Close" className={_class} onClick={onClick}></Button>
  )
}

export default CloseButton
