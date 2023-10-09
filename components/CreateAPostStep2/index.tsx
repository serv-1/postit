import Input from 'components/Input'
import InputError from 'components/InputError'
import Select from 'components/Select'
import TextArea from 'components/TextArea'
import Button from 'components/Button'
import { CATEGORIES } from 'constants/index'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

interface CreateAPostStep2Props {
  step: 0 | 1 | 2
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

export default function CreateAPostStep2({
  step,
  setStep,
}: CreateAPostStep2Props) {
  return (
    <div
      data-testid="step2"
      className={
        step === 2 ? 'flex flex-col gap-y-16 justify-between' : 'hidden'
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
        <Button fullWidth color="primary">
          Post
        </Button>
      </div>
    </div>
  )
}
