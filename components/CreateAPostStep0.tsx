import Button from './Button'
import '../node_modules/leaflet/dist/leaflet.css'
import PostLocationModal from './PostLocationModal'
import { useWatch } from 'react-hook-form'

interface CreateAPostStep0Props {
  step: 0 | 1 | 2
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

const CreateAPostStep0 = ({ step, setStep }: CreateAPostStep0Props) => {
  const location = useWatch<{ location?: string }>({ name: 'location' })
  return (
    <div
      data-testid="step0"
      className={step === 0 ? 'h-full flex flex-col gap-y-16' : 'hidden'}
    >
      <p>If you wrote your true address, it will never be displayed.</p>
      <PostLocationModal />
      <div className="flex-grow flex flex-row items-end">
        <Button
          fullWidth
          type="button"
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
