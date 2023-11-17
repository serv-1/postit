'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import type { PostsIdPutError } from 'app/api/posts/[id]/types'
import Accordion from 'components/Accordion'
import ExpandedImageModal from 'components/ExpandedImageModal'
import Form from 'components/Form'
import Input from 'components/Input'
import InputError from 'components/InputError'
import PostAddressModal from 'components/PostAddressModal'
import Select from 'components/Select'
import TextArea from 'components/TextArea'
import { CATEGORIES } from 'constants/index'
import addSpacesToNum from 'functions/addSpacesToNum'
import sendImage from 'functions/sendImage'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import updatePost, { type UpdatePost } from 'schemas/client/updatePost'
import type { Post } from 'types'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

interface UpdatePostFormProps {
  post: Post
}

export default function UpdatePostForm({ post }: UpdatePostFormProps) {
  const [latLon, setLatLon] = useState<[number, number]>()

  const methods = useForm<UpdatePost>({
    resolver: joiResolver(updatePost),
  })

  const { setToast } = useToast()

  const submitHandler: SubmitHandler<UpdatePost> = async (data) => {
    let images: string[] | undefined = undefined

    try {
      if (data.images) {
        images = await Promise.all(data.images.map(sendImage))
      }
    } catch (e) {
      setToast({ message: (e as Error).message, error: true })

      return
    }

    const response = await ajax.put(
      '/posts/' + post.id,
      { ...data, images, latLon: data.address ? latLon : undefined },
      { csrf: true }
    )

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
          <Input type="text" name="name" className="bg-fuchsia-50" />
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
          <Input
            type="number"
            name="price"
            addOn={<span className="text-fuchsia-900/50">€</span>}
            className="bg-fuchsia-50"
          />
          <InputError inputName="price" />
        </div>
      </Accordion>
      <Accordion title="Images" id="images" headingLevel={2}>
        <div className="mb-16">
          Actual images
          <div className="flex flex-row flex-nowrap gap-x-4">
            {[0, 1, 2, 3, 4].map((i) =>
              post.images[i] ? (
                <ExpandedImageModal
                  key={post.images[i]}
                  src={post.images[i]}
                  btnClass="w-full aspect-square focus:outline-4 focus:outline-dashed focus:outline-fuchsia-600 rounded-8"
                  btnImgClass="rounded-8"
                />
              ) : (
                <div
                  key={i}
                  className="w-full rounded-8 aspect-square bg-fuchsia-100"
                ></div>
              )
            )}
          </div>
        </div>
        <div>
          <label htmlFor="images">New images</label>
          <Input type="file" multiple name="images" className="bg-fuchsia-50" />
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
      <button className="primary-btn block ml-auto">Update</button>
    </Form>
  )
}
