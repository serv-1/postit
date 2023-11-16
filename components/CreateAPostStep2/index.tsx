import Input from 'components/Input'
import InputError from 'components/InputError'
import Select from 'components/Select'
import TextArea from 'components/TextArea'
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
      className={step === 2 ? 'h-full flex flex-col' : 'hidden'}
    >
      <div className="mb-16">
        <label htmlFor="name">Name</label>
        <Input type="text" name="name" className="bg-fuchsia-50" needFocus />
        <InputError inputName="name" />
      </div>
      <div className="mb-16">
        <label htmlFor="price">Price</label>
        <Input
          type="number"
          name="price"
          addOn={<span className="text-fuchsia-900/50">€</span>}
          className="bg-fuchsia-50"
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
      <div className="mt-auto flex gap-x-16">
        <button
          className="secondary-btn w-full"
          type="button"
          onClick={() => setStep(1)}
        >
          ← Back
        </button>
        <button className="primary-btn w-full">Post</button>
      </div>
    </div>
  )
}
