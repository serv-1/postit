import Image from 'next/image'
import Modal from 'components/Modal'
import X from 'public/static/images/x.svg'
import { useState } from 'react'
import classNames from 'classnames'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

interface ExpandedImageModalProps {
  src: string
  btnClass?: string
  btnImgClass?: string
}

export default function ExpandedImageModal({
  btnClass,
  src,
  btnImgClass,
}: ExpandedImageModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Expand"
        className={classNames('relative', btnClass)}
      >
        <Image
          src={NEXT_PUBLIC_AWS_URL + '/' + src}
          alt=""
          fill
          className={classNames('object-cover', btnImgClass)}
        />
      </button>
      {isOpen && (
        <Modal
          onClose={() => setIsOpen(false)}
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
              <Image
                src={NEXT_PUBLIC_AWS_URL + '/' + src}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
