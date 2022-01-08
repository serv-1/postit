import { Dispatch, SetStateAction } from 'react'
import Button from './Button'

type OpenModalButtonProps = {
  name: string
  className: string
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

const OpenModalButton = ({
  name,
  className,
  setIsModalOpen,
}: OpenModalButtonProps) => {
  return (
    <Button className={className} onClick={() => setIsModalOpen(true)}>
      {name}
    </Button>
  )
}

export default OpenModalButton
