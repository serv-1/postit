import Modal from './Modal'
import X from '../public/static/images/x.svg'
import Camera from '../public/static/images/camera.svg'
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
          className="fixed top-0 left-0 w-screen h-screen bg-fuchsia-50 z-10"
        >
          <div className="relative w-full h-full overflow-y-auto md:p-16 md:flex md:flex-col md:flex-nowrap lg:max-w-[1200px] lg:mx-auto">
            <div className="absolute top-8 right-8 z-20 md:static md:shadow-none md:self-end md:mb-16">
              <DotButton onClick={() => setIsOpen(false)} aria-label="Close">
                <X className="w-full h-full" />
              </DotButton>
            </div>
            <ul className="md:flex md:flex-row md:flex-wrap md:justify-center md:content-center md:gap-16 lg:gap-24">
              {sources.map((src) => (
                <li
                  key={src}
                  className="md:w-[calc(50%-8px)] lg:w-[calc(50%-12px)]"
                >
                  <ExpandedImageModal
                    src={src}
                    btnClass="w-full h-[300px] focus:border-4 focus:border-dashed focus:border-fuchsia-600"
                    btnImgClass="md:rounded-16"
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
