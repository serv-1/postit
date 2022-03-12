import { IImage, IPost } from '../types/common'
import X from '../public/static/images/x.svg'
import Pencil from '../public/static/images/pencil.svg'
import { useState } from 'react'
import Modal from './Modal'
import Form from './Form'
import { SubmitHandler, useForm } from 'react-hook-form'
import Button from './Button'
import Input from './Input'
import Label from './Label'
import InputError from './InputError'
import Select from './Select'
import Image from 'next/image'
import categories from '../categories'
import { joiResolver } from '@hookform/resolvers/joi'
import {
  PostsIdPutClientSchema,
  postsIdPutClientSchema,
} from '../lib/joi/postsIdPutSchema'
import isImageValid from '../utils/functions/isImageValid'
import { useToast } from '../contexts/toast'
import axios, { AxiosError } from 'axios'
import getAxiosError from '../utils/functions/getAxiosError'
import readAsDataUrl from '../utils/functions/readAsDataUrl'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface ProfilePostProps {
  post: IPost
}

const ProfilePost = ({ post }: ProfilePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { setToast } = useToast()

  const methods = useForm<PostsIdPutClientSchema>({
    resolver: joiResolver(postsIdPutClientSchema),
  })

  const submitHandler: SubmitHandler<PostsIdPutClientSchema> = async (data) => {
    const purifiedData: Omit<PostsIdPutClientSchema, 'images'> & {
      images?: IImage[]
    } = { csrfToken: data.csrfToken }

    if (data.images) {
      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i]

        const message = isImageValid(image)

        if (message) {
          return methods.setError('images', { message }, { shouldFocus: true })
        }

        const result = await readAsDataUrl<'jpeg' | 'png' | 'gif'>(image)

        if (typeof result === 'string') {
          methods.setError('images', { message: result }, { shouldFocus: true })
          return
        } else if (purifiedData.images) {
          purifiedData.images.push(result)
        } else {
          purifiedData.images = [result]
        }
      }
    }

    try {
      if (data.name) purifiedData.name = data.name
      if (data.description) purifiedData.description = data.description
      if (data.categories) purifiedData.categories = data.categories
      if (data.price) purifiedData.price = data.price

      await axios.put(
        'http://localhost:3000/api/posts/' + post.id,
        purifiedData
      )

      setToast({ message: 'The post has been updated! 🎉' })
    } catch (e) {
      type FieldsNames = keyof Required<PostsIdPutClientSchema>
      const { message, name } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <>
      <div className="bg-indigo-600 text-white flex justify-between p-8 rounded mb-8 last-of-type:mb-0">
        <Button needDefaultClassNames={false} aria-label="Delete">
          <X className="text-white" />
        </Button>
        <span className="leading-[16px]">{post.name}</span>
        <Button
          needDefaultClassNames={false}
          onClick={() => setIsModalOpen(true)}
          aria-label="Edit"
        >
          <Pencil className="text-white" />
        </Button>
      </div>
      {isModalOpen && (
        <Modal title="Update post" setIsOpen={setIsModalOpen}>
          <Form
            method="post"
            methods={methods}
            submitHandlers={{ submitHandler }}
            needCsrfToken
          >
            <div className="mb-16">
              <Label htmlFor="name" labelText="New name" />
              <p className="text-s mb-4">
                Actual name:{' '}
                <span className="text-indigo-600">{post.name}</span>
              </p>
              <Input type="text" name="name" />
              <InputError inputName="name" />
            </div>
            <div className="mb-16">
              <Label htmlFor="description" labelText="New description" />
              <p className="text-s mb-4">
                Actual description:{' '}
                <span className="text-indigo-600">{post.description}</span>
              </p>
              <Input isTextArea name="description" />
              <InputError inputName="description" />
            </div>
            <div className="mb-16">
              <Label htmlFor="categories" labelText="New categories" />
              <p className="text-s mb-4">
                Actual categories:{' '}
                {post.categories.map((category, i) => (
                  <span key={category} className="text-indigo-600">
                    {category}
                    {i === post.categories.length - 1 ? '' : ','}
                  </span>
                ))}
              </p>
              <Select name="categories" options={options} />
              <InputError inputName="categories" />
            </div>
            <div className="mb-16">
              <Label htmlFor="price" labelText="New price" />
              <p className="text-s mb-4">
                Actual price:{' '}
                <span className="text-indigo-600">{post.price}€</span>
              </p>
              <Input type="number" name="price" />
              <InputError inputName="price" />
            </div>
            <div className="mb-16">
              <Label htmlFor="images" labelText="New images" />
              <p className="text-s mb-4">Actual images:</p>
              <div className="flex flex-row flex-nowrap mb-4">
                {post.images.map((image) => (
                  <a
                    href={image}
                    target="_blank"
                    rel="noreferrer"
                    key={image}
                    className="block w-64 h-64 relative first:rounded-l last:rounded-r overflow-clip"
                  >
                    <Image src={image} alt="" layout="fill" />
                  </a>
                ))}
              </div>
              <Input type="file" multiple name="images" />
              <InputError inputName="images" />
            </div>
            <Button type="submit" className="w-full">
              Update
            </Button>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default ProfilePost
