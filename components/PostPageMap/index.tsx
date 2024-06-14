'use client'

import { useState } from 'react'
import Modal from 'components/Modal'
import X from 'public/static/images/x.svg'
import ScreenFull from 'public/static/images/screen-full.svg'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('components/Map'), { ssr: false })
const MapInvalidateSize = dynamic(
  () => import('components/MapInvalidateSize'),
  { ssr: false }
)

interface PostPageMapProps {
  address: string
  latLon: [number, number]
}

export default function PostPageMap({ address, latLon }: PostPageMapProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Map
        zoom={11}
        center={latLon}
        className="w-full h-[200px] lg:h-[250px] rounded-8"
      >
        <div className="absolute top-8 right-8 z-[501]">
          <button
            className="sm-round-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Full screen"
          >
            <ScreenFull className="w-full h-full" />
          </button>
        </div>
      </Map>
      <div className="text-center break-words">{address}</div>
      <Modal
        isHidden={!isOpen}
        className={
          isOpen ? 'fixed top-0 left-0 w-screen h-screen z-[9999]' : 'hidden'
        }
        onClose={() => setIsOpen(false)}
      >
        <Map zoom={11} center={latLon} className="w-screen h-screen">
          <MapInvalidateSize resize={isOpen} />
        </Map>
        <div className="absolute top-8 right-8 z-[501]">
          <button
            className="round-btn"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="w-full h-full" />
          </button>
        </div>
      </Modal>
    </>
  )
}
