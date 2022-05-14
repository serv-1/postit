import Input from './Input'
import InputError from './InputError'
import Select from './Select'
import TextArea from './TextArea'
import categories from '../categories'
import Button from './Button'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface CreateAPostStep2Props {
  step: React.SetStateAction<0 | 1 | 2>
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

const CreateAPostStep2 = ({ step, setStep }: CreateAPostStep2Props) => {
  return (
    <div
      data-testid="step2"
      className={
        step === 2 ? 'h-full flex flex-col gap-y-16 justify-between' : 'hidden'
      }
    >
      <div>
        <div className="mb-16">
          <label htmlFor="name">Name</label>
          <Input type="text" name="name" needFocus />
          <InputError inputName="name" />
        </div>

        <div className="mb-16">
          <label htmlFor="price">Price</label>
          <Input
            type="number"
            name="price"
            addOn="€"
            addOnClass="text-fuchsia-900/50"
          />
          <InputError inputName="price" />
        </div>

        <div className="mb-16">
          <label htmlFor="categories">Categories</label>
          <Select name="categories" options={options} />
          <InputError inputName="categories" />
        </div>

        <div className="mb-16">
          <label htmlFor="description">Description</label>
          <TextArea name="description" />
          <InputError inputName="description" />
        </div>
      </div>

      <div className="flex gap-x-16">
        <Button
          type="button"
          fullWidth
          color="secondary"
          onClick={() => setStep(1)}
        >
          ← Back
        </Button>
        <Button type="button" fullWidth color="primary">
          Post
        </Button>
      </div>
    </div>
  )
}

export default CreateAPostStep2
