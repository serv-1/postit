'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import axios from 'axios'
import Accordion from 'components/Accordion'
import Button from 'components/Button'
import ExpandedImageModal from 'components/ExpandedImageModal'
import Form from 'components/Form'
import GlassWrapper from 'components/GlassWrapper'
import Header from 'components/Header'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PostAddressModal from 'components/PostAddressModal'
import Select from 'components/Select'
import ShapeContainer from 'components/ShapeContainer'
import TextArea from 'components/TextArea'
import { useToast } from 'contexts/toast'
import useLinearBackgroundGradient from 'hooks/useLinearBackgroundGradient'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import updatePostSchema, {
  type UpdatePostSchema,
} from 'schemas/updatePostSchema'
import type { Entries, Post } from 'types/common'
import categories from 'utils/constants/categories'
import err from 'utils/constants/errors'
import addSpacesToNb from 'utils/functions/addSpacesToNb'
import getAxiosError from 'utils/functions/getAxiosError'
import isImage from 'utils/functions/isImage'
import isImageTooBig from 'utils/functions/isImageTooBig'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface S3Res {
  url: string
  key: string
  fields: Record<string, string>
}

type FilteredData = Omit<UpdatePostSchema, 'images'> & {
  images?: string[]
  latLon?: [number, number]
}

export default function UpdatePost({
  post,
  csrfToken,
}: {
  post: Post
  csrfToken?: string
}) {
  const [latLon, setLatLon] = useState<[number, number]>()

  const methods = useForm<UpdatePostSchema>({
    resolver: joiResolver(updatePostSchema),
  })

  useLinearBackgroundGradient()

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<UpdatePostSchema> = async (data) => {
    const { images, ...rest } = data
    const filteredData: FilteredData = rest

    if (rest.address) filteredData.latLon = latLon

    for (const entry of Object.entries(filteredData) as Entries<typeof data>) {
      if (!entry[1]) delete filteredData[entry[0]]
    }

    try {
      if (images) {
        for (let i = 0; i < images.length; i++) {
          if (!isImage(images[i].type)) {
            return methods.setError(
              'images',
              { message: err.IMAGE_INVALID },
              { shouldFocus: true }
            )
          }

          if (isImageTooBig(images[i].size)) {
            return methods.setError(
              'images',
              { message: err.IMAGE_TOO_BIG },
              { shouldFocus: true }
            )
          }

          const res = await axios.get<S3Res>('/api/s3?csrfToken=' + csrfToken)
          const { url, fields, key } = res.data

          const formData = new FormData()
          Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
          formData.append('file', images[i])

          await axios.post(url, formData)

          if (filteredData.images) {
            filteredData.images.push(key)
          } else {
            filteredData.images = [key]
          }
        }
      }

      await axios.put('/api/posts/' + post.id, filteredData)
      setToast({ message: 'The post has been updated! 🎉' })
    } catch (e) {
      type FieldsNames = keyof Required<UpdatePostSchema>
      const { message, name, status } = getAxiosError<FieldsNames>(e)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      } else if (status === 400) {
        return setToast({ message: err.IMAGE_TOO_BIG, error: true })
      } else if (!message) {
        return setToast({ message: err.DEFAULT, error: true })
      }

      setToast({ message, error: true })
    }
  }

  return (
    <main className="flex flex-col justify-center items-center row-span-2">
      <Header />
      <GlassWrapper padding="p-32">
        <ShapeContainer>
          <h1>Update the post</h1>
          <p className="my-16">Only fill the inputs you want to update.</p>
          <Form
            method="post"
            methods={methods}
            submitHandler={submitHandler}
            csrfToken={csrfToken}
            className="h-full"
          >
            <Accordion title="Name" id="name" headingLevel={2}>
              <div className="mb-16">
                Actual name
                <div className="bg-fuchsia-100 rounded-8 p-8 break-words">
                  {post.name}
                </div>
              </div>
              <div>
                <label htmlFor="name">New name</label>
                <Input type="text" name="name" />
                <InputError inputName="name" />
              </div>
            </Accordion>

            <Accordion title="Description" id="description" headingLevel={2}>
              <div className="mb-16">
                Actual description
                <div className="bg-fuchsia-100 rounded-8 p-8 break-words">
                  {post.description}
                </div>
              </div>
              <div>
                <label htmlFor="description">New description</label>
                <TextArea name="description" />
                <InputError inputName="description" />
              </div>
            </Accordion>

            <Accordion title="Categories" id="categories" headingLevel={2}>
              <div className="mb-16">
                Actual categories
                <div className="bg-fuchsia-100 rounded-8 p-8 break-words">
                  {post.categories.join(', ')}
                </div>
              </div>
              <div>
                <label htmlFor="categories">New Categories</label>
                <Select name="categories" options={options} />
                <InputError inputName="categories" />
              </div>
            </Accordion>

            <Accordion title="Price" id="price" headingLevel={2}>
              <div className="mb-16">
                Actual price
                <div className="bg-fuchsia-100 rounded-8 p-8">
                  {addSpacesToNb(post.price)}€
                </div>
              </div>
              <div>
                <label htmlFor="price">New price</label>
                <Input type="number" name="price" addOn="€" />
                <InputError inputName="price" />
              </div>
            </Accordion>

            <Accordion title="Images" id="images" headingLevel={2}>
              <div className="mb-16">
                Actual images
                <div className="flex flex-row flex-nowrap gap-x-4">
                  {[0, 1, 2, 3, 4].map((i) => {
                    if (post.images[i]) {
                      return (
                        <ExpandedImageModal
                          key={post.images[i]}
                          src={post.images[i]}
                          btnClass="w-full aspect-square focus:outline-4 focus:outline-dashed focus:outline-fuchsia-600 rounded-8"
                          btnImgClass="rounded-8"
                        />
                      )
                    }
                    return (
                      <div
                        key={i}
                        className="w-full rounded-8 aspect-square bg-fuchsia-100"
                      ></div>
                    )
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="images">New images</label>
                <Input type="file" multiple name="images" />
                <InputError inputName="images" />
              </div>
            </Accordion>

            <Accordion title="Address" id="address" headingLevel={2}>
              <div className="mb-16">
                Actual address
                <div className="bg-fuchsia-100 rounded-8 p-8 break-words">
                  {post.address}
                </div>
              </div>
              <div>
                <label htmlFor="address">New address</label>
                <PostAddressModal setLatLon={setLatLon} latLon={latLon} />
              </div>
            </Accordion>

            <div className="flex justify-end">
              <Button color="primary">Update</Button>
            </div>
          </Form>
        </ShapeContainer>
      </GlassWrapper>
    </main>
  )
}

UpdatePost.needAuth = true
