import Image from 'next/image'
import Modal from './Modal'
import X from '../public/static/images/x.svg'
import { useState } from 'react'
import classNames from 'classnames'
import DotButton from './DotButton'

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
          className="fixed top-0 left-0 w-screen h-screen bg-fuchsia-50 z-30"
        >
          <div className="relative p-8 flex flex-col flex-nowrap w-full h-full md:p-16 lg:max-w-[1200px] lg:mx-auto">
            <div className="absolute top-8 right-8 z-20 md:static md:shadow-none md:self-end md:mb-16">
              <DotButton onClick={() => setIsOpen(false)} aria-label="Close">
                <X className="w-full h-full" />
              </DotButton>
            </div>
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
