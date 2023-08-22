import Modal from './Modal'
import X from 'public/static/images/x.svg'
import Camera from 'public/static/images/camera.svg'
import { useState } from 'react'
import ExpandedImageModal from './ExpandedImageModal'
import DotButton from './DotButton'

interface SeeAllPhotosModalProps {
  sources: string[]
}

const SeeAllPhotosModal = ({ sources }: SeeAllPhotosModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div className="absolute bottom-8 right-8">
        <DotButton onClick={() => setIsOpen(true)} aria-label="See all photos">
          <Camera className="w-full h-full" />
        </DotButton>
      </div>
      {isOpen && (
        <Modal
          setIsOpen={setIsOpen}
          className="fixed top-0 left-0 w-screen h-screen bg-fuchsia-50 z-[9999]"
        >
          <div className="h-full overflow-y-auto flex flex-col lg:max-w-[1200px] lg:mx-auto pb-8 md:pb-16">
            <button
              className="text-fuchsia-600 self-end p-8 md:p-16 hover:text-fuchsia-900 transition-colors duration-200"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-32 h-32" />
            </button>
            <ul className="flex flex-col gap-8 px-8 md:flex-row md:flex-wrap md:justify-center md:content-center md:gap-16 lg:gap-24">
              {sources.map((src) => (
                <li
                  key={src}
                  className="md:w-[calc(50%-8px)] lg:w-[calc(50%-12px)]"
                >
                  <ExpandedImageModal
                    src={src}
                    btnClass="w-full h-[300px] focus:border-4 focus:border-dashed focus:border-fuchsia-600"
                    btnImgClass="rounded-8 md:rounded-16"
                  />
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </>
  )
}

export default SeeAllPhotosModal
