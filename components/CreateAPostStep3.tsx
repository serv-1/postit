import Input from './Input'
import InputError from './InputError'
import MainButton from './MainButton'
import Select from './Select'
import TextArea from './TextArea'
import categories from '../categories'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface CreateAPostStep3Props {
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

const CreateAPostStep3 = ({ setStep }: CreateAPostStep3Props) => {
  return (
    <>
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
            addOnClass="text-[rgba(112,26,117,0.5)]"
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

      <div className="flex flex-row flex-nowrap">
        <MainButton
          type="button"
          onClick={() => setStep(1)}
          bgColor={{
            base: 'bg-fuchsia-200',
            states: 'hover:bg-fuchsia-400',
          }}
          textColor={{ base: 'text-fuchsia-900', states: false }}
          className="w-1/2 mr-16 md:bg-fuchsia-300"
        >
          ← Back
        </MainButton>
        <MainButton
          className="w-1/2"
          bgColor={{ states: 'hover:bg-fuchsia-400' }}
        >
          Post
        </MainButton>
      </div>
    </>
  )
}

export default CreateAPostStep3
