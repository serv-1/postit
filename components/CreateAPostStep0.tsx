import dynamic from 'next/dynamic'
import Button from './Button'
import '../node_modules/leaflet/dist/leaflet.css'
import Image from 'next/image'
import { useState } from 'react'
import Modal from './Modal'
import DotButton from './DotButton'
import X from '../public/static/images/x.svg'
import MapInput from './MapInput'

const Map = dynamic(() => import('./Map'), { ssr: false })
const MapFlyToLatLon = dynamic(() => import('./MapFlyToLatLon'), { ssr: false })
const MapInvalidateSize = dynamic(() => import('./MapInvalidateSize'), {
  ssr: false,
})

interface CreateAPostStep0Props {
  step: 0 | 1 | 2
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
  location?: string
  setLocation: React.Dispatch<React.SetStateAction<string | undefined>>
}

const CreateAPostStep0 = (props: CreateAPostStep0Props) => {
  const { step, setStep, setLocation, location } = props
  const [isOpen, setIsOpen] = useState(false)
  const [latLon, setLatLon] = useState<[number, number]>()

  return (
    <div
      data-testid="step0"
      className={step === 0 ? 'h-full flex flex-col gap-y-16' : 'hidden'}
    >
      <p>If you wrote your true address, it will never be displayed.</p>
      <button
        className="relative w-full h-[264px] group"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src="https://maps.locationiq.com/v3/staticmap?key=pk.956a05610e523c7773a4307bbd557cf4&center=37.777,-122.42&zoom=10"
          alt=""
          layout="fill"
          className="rounded-8"
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-fuchsia-900/[.65] text-fuchsia-50 text-m-2xl md:text-t-xl font-bold rounded-8 [text-shadow:0_0_16px_#701A75] group-hover:bg-fuchsia-900/[.75] transition-colors duration-200">
          Open map
        </div>
      </button>
      <Modal
        setIsOpen={setIsOpen}
        className={
          isOpen ? 'w-screen h-screen absolute top-0 left-0' : 'hidden'
        }
      >
        <MapInput setLatLon={setLatLon} setLocation={setLocation} />
        <Map className="w-screen h-screen" zoom={12}>
          <MapInvalidateSize resize={isOpen} />
          <MapFlyToLatLon latLon={latLon} />
        </Map>
        <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-[999] md:left-auto md:translate-x-0 md:right-[10px] md:top-[10px]">
          <DotButton onClick={() => setIsOpen(false)} aria-label="Close map">
            <X className="w-full h-full" />
          </DotButton>
        </div>
      </Modal>
      <div className="flex-grow flex flex-row items-end">
        <Button
          fullWidth
          type="submit"
          color="primary"
          onClick={() => setStep(1)}
          disabled={!location}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

export default CreateAPostStep0
