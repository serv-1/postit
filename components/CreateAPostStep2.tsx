import Input from './Input'
import InputError from './InputError'
import Select from './Select'
import TextArea from './TextArea'
import categories from '../categories'
import Button from './Button'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { IImage } from '../types/common'
import Form from './Form'
import axios from 'axios'
import getAxiosError from '../utils/functions/getAxiosError'
import { useToast } from '../contexts/toast'
import { useRouter } from 'next/router'
import addPostSchema, { AddPostSchema } from '../schemas/addPostSchema'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface CreateAPostStep2Props {
  csrfToken?: string
  images?: IImage[]
  latLon?: [number, number]
  step: 0 | 1 | 2
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
}

const CreateAPostStep2 = (props: CreateAPostStep2Props) => {
  const { csrfToken, images, latLon, step, setStep } = props

  const { setToast } = useToast()
  const router = useRouter()

  const methods = useForm<AddPostSchema>({
    resolver: joiResolver(addPostSchema),
  })

  const submitHandler: SubmitHandler<AddPostSchema> = async (data) => {
    try {
      const _data = { ...data, images, latLon }
      await axios.post('http://localhost:3000/api/post', _data)
      router.push('/profile')
    } catch (e) {
      const { name, message } = getAxiosError<keyof AddPostSchema>(e)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <Form
      methods={methods}
      submitHandler={submitHandler}
      csrfToken={csrfToken}
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
        <Button fullWidth color="primary">
          Post
        </Button>
      </div>
    </Form>
  )
}

export default CreateAPostStep2
