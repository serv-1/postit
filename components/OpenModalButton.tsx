import { ComponentPropsWithoutRef, Dispatch, SetStateAction } from 'react'
import Button from './Button'

export interface OpenModalButtonProps
  extends ComponentPropsWithoutRef<'button'> {
  name: string
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

const OpenModalButton = ({
  name,
  setIsModalOpen,
  ...props
}: OpenModalButtonProps) => {
  return (
    <Button {...props} onClick={() => setIsModalOpen(true)}>
      {name}
    </Button>
  )
}

export default OpenModalButton
