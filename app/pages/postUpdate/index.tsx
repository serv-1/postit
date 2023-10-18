'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import type { PostsIdPutError } from 'app/api/posts/[id]/types'
import type { S3GetData, S3GetError } from 'app/api/s3/types'
import Accordion from 'components/Accordion'
import Button from 'components/Button'
import ExpandedImageModal from 'components/ExpandedImageModal'
import Form from 'components/Form'
import GlassWrapper from 'components/GlassWrapper'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PostAddressModal from 'components/PostAddressModal'
import Select from 'components/Select'
import ShapeContainer from 'components/ShapeContainer'
import TextArea from 'components/TextArea'
import { useToast } from 'contexts/toast'
import ajax from 'libs/ajax'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import updatePost, { type UpdatePost } from 'schemas/client/updatePost'
import type { Entries, Post } from 'types'
import addSpacesToNum from 'functions/addSpacesToNum'
import { IMAGE_TOO_BIG, DEFAULT } from 'constants/errors'
import { CATEGORIES } from 'constants/index'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

type FilteredData = Omit<UpdatePost, 'images'> & {
  images?: string[]
  latLon?: [number, number]
}

export default function UpdatePost({ post }: { post: Post }) {
  const [latLon, setLatLon] = useState<[number, number]>()

  const methods = useForm<UpdatePost>({ resolver: joiResolver(updatePost) })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<UpdatePost> = async (data) => {
    const { images, ...dataRest } = data
    const filteredData: FilteredData = dataRest

    if (dataRest.address) filteredData.latLon = latLon

    for (const entry of Object.entries(filteredData) as Entries<typeof data>) {
      if (!entry[1]) delete filteredData[entry[0]]
    }

    if (images) {
      for (const image of images) {
        let response = await ajax.get('/s3', { csrf: true })

        if (!response.ok) {
          const { message }: S3GetError = await response.json()

          setToast({ message, error: true })

          return
        }

        const { url, fields, key }: S3GetData = await response.json()
        const formData = new FormData()

        Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
        formData.append('file', image)

        response = await fetch(url, { method: 'POST', body: formData })

        if (!response.ok) {
          setToast({
            message: response.status === 400 ? IMAGE_TOO_BIG : DEFAULT,
            error: true,
          })

          return
        }

        if (filteredData.images) {
          filteredData.images.push(key)
        } else {
          filteredData.images = [key]
        }
      }
    }

    const response = await ajax.put('/posts/' + post.id, filteredData, {
      csrf: true,
    })

    if (!response.ok) {
      const { name, message }: PostsIdPutError = await response.json()

      if (name) {
        methods.setError(
          name as keyof UpdatePost,
          { message },
          { shouldFocus: true }
        )
      } else {
        setToast({ message, error: true })
      }

      return
    }

    setToast({ message: 'The post has been updated! 🎉' })
  }

  return (
    <main className="flex justify-center">
      <GlassWrapper padding="p-32">
        <ShapeContainer>
          <h1>Update the post</h1>
          <p className="my-16">Only fill the inputs you want to update.</p>
          <Form
            method="post"
            methods={methods}
            submitHandler={submitHandler}
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
                  {addSpacesToNum(post.price)}€
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
