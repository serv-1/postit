import Button from './Button'

interface CreateAPostStep0Props {
  step: React.SetStateAction<0 | 1 | 2>
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

const CreateAPostStep0 = ({ step, setStep }: CreateAPostStep0Props) => {
  return (
    <div
      data-testid="step0"
      className={
        step === 0 ? 'h-full flex flex-col gap-y-16 justify-between' : 'hidden'
      }
    >
      <p className="mb-16">
        If you wrote your true address, it will never be displayed.
      </p>
      <div className="flex gap-x-16">
        <Button
          fullWidth
          type="button"
          color="primary"
          onClick={() => setStep(1)}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

export default CreateAPostStep0
