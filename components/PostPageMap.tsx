import { useState } from 'react'
import DotButton from './DotButton'
import Modal from './Modal'
import X from '../public/static/images/x.svg'
import ScreenFull from '../public/static/images/screen-full.svg'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })
const MapInvalidateSize = dynamic(() => import('./MapInvalidateSize'), {
  ssr: false,
})

interface PostPageMapProps {
  address: string
  latLon: [number, number]
}

const PostPageMap = ({ address, latLon }: PostPageMapProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Map
        zoom={11}
        center={latLon}
        className="w-full h-[200px] lg:h-[250px] rounded-8"
      >
        <div className="absolute top-8 right-8 z-[501]">
          <DotButton
            onClick={() => setIsOpen(true)}
            isSmall
            aria-label="Full screen"
          >
            <ScreenFull className="w-full h-full" />
          </DotButton>
        </div>
      </Map>
      <div className="text-center break-words">{address}</div>
      <Modal
        isHidden={!isOpen}
        className={
          isOpen ? 'fixed top-0 left-0 w-screen h-screen z-[9999]' : 'hidden'
        }
        setIsOpen={setIsOpen}
      >
        <Map zoom={11} center={latLon} className="w-screen h-screen">
          <MapInvalidateSize resize={isOpen} />
        </Map>
        <div className="absolute top-8 right-8 z-[501]">
          <DotButton
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="w-full h-full" />
          </DotButton>
        </div>
      </Modal>
    </>
  )
}

export default PostPageMap
