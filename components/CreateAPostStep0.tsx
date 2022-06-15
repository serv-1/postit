import Button from './Button'
import '../node_modules/leaflet/dist/leaflet.css'
import PostAddressModal from './PostAddressModal'
import { useWatch } from 'react-hook-form'

interface CreateAPostStep0Props {
  step: 0 | 1 | 2
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
  latLon?: [number, number]
  setLatLon: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
}

const CreateAPostStep0 = (props: CreateAPostStep0Props) => {
  const { step, setStep, latLon, setLatLon } = props
  const address = useWatch<{ address?: string }>({ name: 'address' })
  return (
    <div
      data-testid="step0"
      className={step === 0 ? 'h-full flex flex-col gap-y-16' : 'hidden'}
    >
      <p>If you wrote your true address, it will never be displayed.</p>
      <PostAddressModal latLon={latLon} setLatLon={setLatLon} />
      <div className="flex-grow flex flex-row items-end">
        <Button
          fullWidth
          type="button"
          color="primary"
          onClick={() => setStep(1)}
          disabled={!address}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

export default CreateAPostStep0
