import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import Button from '../components/Button'
import Form from '../components/Form'
import { useToast } from '../contexts/toast'
import {
  createPostClientSchema,
  CreatePostClientSchema,
} from '../lib/joi/createPostSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import { useRouter } from 'next/router'
import { IImage } from '../types/common'
import isImageValid from '../utils/functions/isImageValid'
import readAsDataUrl from '../utils/functions/readAsDataUrl'
import Head from 'next/head'
import Input from '../components/Input'
import InputError from '../components/InputError'
import Select from '../components/Select'
import categories from '../categories'
import TextArea from '../components/TextArea'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

const CreateAPost = () => {
  const resolver = joiResolver(createPostClientSchema)
  const methods = useForm<CreatePostClientSchema>({ resolver })
  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<CreatePostClientSchema> = async (data) => {
    const { images } = data
    const encodedImages: IImage[] = []

    for (const image of Array.from(images)) {
      const message = isImageValid(image)

      if (message) {
        return methods.setError('images', { message }, { shouldFocus: true })
      }

      const result = await readAsDataUrl<IImage['ext']>(image)

      if (typeof result === 'string') {
        methods.setError('images', { message: result }, { shouldFocus: true })
      } else {
        encodedImages.push(result)
      }
    }

    try {
      await axios.post('http://localhost:3000/api/post', {
        ...data,
        images: encodedImages,
      })
      router.push('/profile')
    } catch (e) {
      type FieldsNames = keyof CreatePostClientSchema
      const { name, message } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Head>
        <title>Create a post - Filanad</title>
      </Head>
      <main className="py-32 grid grid-cols-4 gap-x-16 justify-center">
        <h1 className="col-span-full text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16">
          Create a post
        </h1>
        <Form
          name="createPost"
          method="post"
          methods={methods}
          submitHandler={submitHandler}
          needCsrfToken
          className="col-span-full"
        >
          <div className="mb-16">
            <label htmlFor="name">Name</label>
            <Input<CreatePostClientSchema> type="text" name="name" needFocus />
            <InputError<CreatePostClientSchema> inputName="name" />
          </div>

          <div className="mb-16">
            <label htmlFor="description">Description</label>
            <TextArea<CreatePostClientSchema> name="description" />
            <InputError<CreatePostClientSchema> inputName="description" />
          </div>

          <div className="mb-16">
            <label htmlFor="categories">Categories</label>
            <Select<CreatePostClientSchema>
              name="categories"
              options={options}
            />
            <InputError<CreatePostClientSchema> inputName="categories" />
          </div>

          <div className="mb-16">
            <label htmlFor="price">Price (euros)</label>
            <Input<CreatePostClientSchema> type="number" name="price" />
            <InputError<CreatePostClientSchema> inputName="price" />
          </div>

          <div className="mb-16">
            <label htmlFor="images">Images</label>
            <Input<CreatePostClientSchema> type="file" name="images" multiple />
            <InputError<CreatePostClientSchema> inputName="images" />
          </div>

          <Button type="submit" className="w-full">
            Create
          </Button>
        </Form>
      </main>
    </>
  )
}

CreateAPost.needAuth = true

export default CreateAPost
