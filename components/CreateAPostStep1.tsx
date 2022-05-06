import MainButton from './MainButton'

interface CreateAPostStep1Props {
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

const CreateAPostStep1 = ({ setStep }: CreateAPostStep1Props) => {
  return (
    <>
      <p className="mb-16">
        If you wrote your true address, it will never be displayed.
      </p>
      <MainButton
        type="button"
        onClick={() => setStep(1)}
        bgColor={{ states: 'hover:bg-fuchsia-400' }}
      >
        Next →
      </MainButton>
    </>
  )
}

export default CreateAPostStep1
