import { Dispatch, ReactNode, SetStateAction } from 'react'
import CloseButton from './CloseButton'

export interface ModalProps {
  children: ReactNode
  title: string
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

const Modal = ({ children, title, setIsModalOpen }: ModalProps) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 text-start"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
    >
      <div className="position-relative bg-white p-2 w-25 rounded shadow start-50 translate-middle-x mt-5">
        <header className="d-flex justify-content-between">
          <h2>{title}</h2>
          <CloseButton onClick={() => setIsModalOpen(false)} />
        </header>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal
