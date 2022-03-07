import { Dispatch, ReactNode, SetStateAction } from 'react'
import Button from './Button'
import X from '../public/static/images/x.svg'

export interface ModalProps {
  children: ReactNode
  title: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const Modal = ({ children, title, setIsOpen }: ModalProps) => {
  return (
    <div className="fixed top-0 right-0 w-full h-full bg-[rgba(0,0,0,0.5)] grid grid-cols-4 gap-x-16 items-center justify-center">
      <div className="col-span-full bg-white rounded p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between mb-16">
          <h3 className="text-4xl md:text-t-2xl lg:text-d-2xl font-bold">
            {title}
          </h3>
          <Button
            needDefaultClassNames={false}
            onClick={() => setIsOpen(false)}
          >
            <X className="w-32 h-32 lg:w-40 lg:h-40" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal
