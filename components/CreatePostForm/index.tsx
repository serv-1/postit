'use client'

import { joiResolver } from '@hookform/resolvers/joi'
import type { PostPostError } from 'app/api/post/types'
import Form from 'components/Form'
import InputError from 'components/InputError'
import PostAddressModal from 'components/PostAddressModal'
import WizardNextButton from 'components/WizardNextButton'
import WizardPrevButton from 'components/WizardPrevButton'
import WizardProvider from 'components/WizardProvider'
import WizardStep from 'components/WizardStep'
import sendImage from 'functions/sendImage'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import createPost, { type CreatePost } from 'schemas/client/createPost'
import Input from 'components/Input'
import Select from 'components/Select'
import TextArea from 'components/TextArea'
import { CATEGORIES } from 'constants/index'
import CreatePostFormImagesStep from 'components/CreatePostFormImagesStep'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export default function CreatePostForm() {
  const [latLon, setLatLon] = useState<[number, number]>()
  const { setToast } = useToast()
  const router = useRouter()
  const methods = useForm<CreatePost>({ resolver: joiResolver(createPost) })

  const submitHandler: SubmitHandler<CreatePost> = async (data) => {
    let images: string[] = []

    try {
      images = await Promise.all(data.images.map(sendImage))
    } catch (e) {
      setToast({ message: (e as Error).message, error: true })

      return
    }

    const response = await ajax.post(
      '/post',
      { ...data, images, latLon },
      { csrf: true }
    )

    if (!response.ok) {
      const { name, message }: PostPostError = await response.json()

      if (name) {
        methods.setError(
          name as keyof CreatePost,
          { message },
          { shouldFocus: true }
        )
      } else {
        setToast({ message, error: true })
      }

      return
    }

    router.push(response.headers.get('location')!)
  }

  return (
    <Form
      method="post"
      methods={methods}
      submitHandler={submitHandler}
      className="grow"
    >
      <WizardProvider>
        <WizardStep className="flex flex-col gap-y-16 h-full">
          <h2>Meeting place</h2>
          <p>Your address will never be displayed in its entirety.</p>
          <PostAddressModal latLon={latLon} setLatLon={setLatLon} />
          <WizardNextButton
            className="primary-btn w-full mt-auto"
            isDisabled={!latLon}
          >
            Next →
          </WizardNextButton>
        </WizardStep>
        <CreatePostFormImagesStep />
        <WizardStep className="flex flex-col gap-y-16 h-full">
          <h2>Finalize</h2>
          <div>
            <label htmlFor="name">Name</label>
            <Input
              type="text"
              name="name"
              className="bg-fuchsia-50"
              needFocus
            />
            <InputError name="name" />
          </div>
          <div>
            <label htmlFor="price">Price</label>
            <Input
              type="number"
              name="price"
              addOn={<span className="text-fuchsia-900/50">€</span>}
              className="bg-fuchsia-50"
            />
            <InputError name="price" />
          </div>
          <div>
            <label htmlFor="categories">Categories</label>
            <Select name="categories" options={options} />
            <InputError name="categories" />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <TextArea name="description" />
            <InputError name="description" />
          </div>
          <div className="flex gap-x-16 mt-auto">
            <WizardPrevButton className="secondary-btn w-full">
              ← Back
            </WizardPrevButton>
            <button className="primary-btn w-full">Post</button>
          </div>
        </WizardStep>
      </WizardProvider>
    </Form>
  )
}
