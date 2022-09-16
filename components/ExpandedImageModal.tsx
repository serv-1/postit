import Image from 'next/image'
import Modal from './Modal'
import X from '../public/static/images/x.svg'
import { useState } from 'react'
import classNames from 'classnames'

interface ExpandedImageModalProps {
  src: string
  btnClass?: string
  btnImgClass?: string
}

const ExpandedImageModal = (props: ExpandedImageModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Expand"
        className={classNames('relative', props.btnClass)}
      >
        <Image
          src={props.src}
          alt=""
          layout="fill"
          objectFit="cover"
          className={props.btnImgClass}
        />
      </button>
      {isOpen && (
        <Modal
          setIsOpen={setIsOpen}
          className="fixed top-0 left-0 w-screen h-screen bg-fuchsia-50 z-[9999]"
        >
          <div className="pb-8 flex flex-col h-full md:pb-16 lg:max-w-[1200px] lg:mx-auto">
            <button
              className="text-fuchsia-600 self-end p-8 md:p-16 hover:text-fuchsia-900 transition-colors duration-200"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-32 h-32" />
            </button>
            <div className="h-full relative">
              <Image src={props.src} alt="" layout="fill" objectFit="contain" />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default ExpandedImageModal
