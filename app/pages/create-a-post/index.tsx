'use client'

import { useState } from 'react'
import CreateAPostStep0 from 'components/CreateAPostStep0'
import CreateAPostStep1 from 'components/CreateAPostStep1'
import CreateAPostStep2 from 'components/CreateAPostStep2'
import GlassWrapper from 'components/GlassWrapper'
import ShapeContainer from 'components/ShapeContainer'
import Form from 'components/Form'
import { useToast } from 'contexts/toast'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import createPost, { type CreatePost } from 'schemas/client/createPost'
import { joiResolver } from '@hookform/resolvers/joi'
import ajax from 'libs/ajax'
import type { S3GetData, S3GetError } from 'app/api/s3/types'
import type { PostPostError } from 'app/api/post/types'
import { IMAGE_TOO_BIG, DEFAULT } from 'constants/errors'

export default function Page() {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [images, setImages] = useState<File[]>([])
  const [latLon, setLatLon] = useState<[number, number]>()

  const titles = ['Where is it?', 'Show us what it is', 'Post!']

  const { setToast } = useToast()
  const router = useRouter()
  const methods = useForm<CreatePost>({ resolver: joiResolver(createPost) })

  const submitHandler: SubmitHandler<CreatePost> = async (data) => {
    const keys: string[] = []

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

      keys.push(key)
    }

    const response = await ajax.post(
      '/post',
      { ...data, images: keys, latLon },
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

    router.push(response.headers.get('location') as string)
  }

  return (
    <GlassWrapper minHeight="min-h-[553.89px] md:min-h-[598px]" padding="p-32">
      <ShapeContainer>
        <h1 className="mb-16">{titles[step]}</h1>
        <Form method="post" methods={methods} submitHandler={submitHandler}>
          <CreateAPostStep0
            step={step}
            setStep={setStep}
            latLon={latLon}
            setLatLon={setLatLon}
          />
          <CreateAPostStep1
            step={step}
            setStep={setStep}
            setImages={setImages}
          />
          <CreateAPostStep2 step={step} setStep={setStep} />
        </Form>
      </ShapeContainer>
    </GlassWrapper>
  )
}
