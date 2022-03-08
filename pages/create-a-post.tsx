import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import Button from '../components/Button'
import FormCategoriesField from '../components/FormCategoriesField'
import Form from '../components/Form'
import FormField from '../components/FormField'
import { useToast } from '../contexts/toast'
import {
  createPostClientSchema,
  CreatePostClientSchema,
} from '../lib/joi/createPostSchema'
import err from '../utils/constants/errors'
import getAxiosError from '../utils/functions/getAxiosError'
import { useRouter } from 'next/router'
import { Image } from '../types/common'

const CreateAPost = () => {
  const resolver = joiResolver(createPostClientSchema)
  const methods = useForm<CreatePostClientSchema>({ resolver })
  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<CreatePostClientSchema> = async (data) => {
    const { images } = data
    const encodedImages: Image[] = []

    for (const image of Array.from(images)) {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(image.type)) {
        return methods.setError(
          'images',
          { message: err.IMAGE_INVALID },
          { shouldFocus: true }
        )
      } else if (image.size > 1000000) {
        return methods.setError(
          'images',
          { message: err.IMAGE_TOO_BIG },
          { shouldFocus: true }
        )
      }

      const reader = new FileReader()

      reader.onload = async (e) => {
        if (!e.target?.result) return

        encodedImages.push({
          base64: (e.target.result as string).split(',')[1],
          type: image.type.split('/')[1] as Image['type'],
        })

        if (encodedImages.length !== images.length) return

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

      reader.readAsDataURL(image)
    }
  }

  return (
    <main className="py-32 grid grid-cols-4 gap-x-16 justify-center">
      <h1 className="col-span-full text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16">
        Create a post
      </h1>
      <Form
        name="createPost"
        method="post"
        submitHandlers={{ submitHandler }}
        methods={methods}
        needCsrfToken
        className="col-span-full"
      >
        <FormField labelText="Name" inputName="name" type="text" needFocus />

        <FormField labelText="Description" inputName="description" isTextArea />

        <FormCategoriesField />

        <FormField labelText="Price (euro)" inputName="price" type="number" />

        <FormField type="file" labelText="Images" inputName="images" multiple />

        <Button type="submit" className="w-full">
          Create
        </Button>
      </Form>
    </main>
  )
}

CreateAPost.needAuth = true

export default CreateAPost
