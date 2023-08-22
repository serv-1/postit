import Image from 'next/image'
import MapInput from './MapInput'
import Modal from './Modal'
import DotButton from './DotButton'
import X from 'public/static/images/x.svg'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })
const MapFlyToLatLon = dynamic(() => import('./MapFlyToLatLon'), { ssr: false })
const MapInvalidateSize = dynamic(() => import('./MapInvalidateSize'), {
  ssr: false,
})

interface PostAddressModalProps {
  latLon?: [number, number]
  setLatLon: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
}

const PostAddressModal = ({ latLon, setLatLon }: PostAddressModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="relative w-full h-[264px] group"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src="https://maps.locationiq.com/v3/staticmap?key=pk.956a05610e523c7773a4307bbd557cf4&center=37.777,-122.42&zoom=10"
          alt=""
          fill
          className="rounded-8"
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-fuchsia-900/[.65] text-fuchsia-50 text-m-2xl md:text-t-xl font-bold rounded-8 [text-shadow:0_0_16px_#701A75] group-hover:bg-fuchsia-900/[.75] transition-colors duration-200">
          Open map
        </div>
      </button>
      <Modal
        isHidden={!isOpen}
        setIsOpen={setIsOpen}
        className={isOpen ? 'w-screen h-screen fixed top-0 left-0' : 'hidden'}
      >
        <MapInput setLatLon={setLatLon} />
        <Map className="w-screen h-screen" zoom={12}>
          <MapInvalidateSize resize={isOpen} />
          <MapFlyToLatLon latLon={latLon} />
        </Map>
        <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-[999] md:bottom-auto md:left-auto md:translate-x-0 md:right-[10px] md:top-[10px]">
          <DotButton
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close map"
          >
            <X className="w-full h-full" />
          </DotButton>
        </div>
      </Modal>
    </>
  )
}

export default PostAddressModal
