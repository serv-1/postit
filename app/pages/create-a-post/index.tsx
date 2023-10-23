'use client'

import { useState } from 'react'
import CreateAPostStep0 from 'components/CreateAPostStep0'
import CreateAPostStep1 from 'components/CreateAPostStep1'
import CreateAPostStep2 from 'components/CreateAPostStep2'
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
import styles from 'styles/invisibleScrollbar.module.css'

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
    <main className="md:bg-linear-wrapper md:rounded-16 md:shadow-wrapper md:p-32">
      <div
        className={
          'flex flex-col h-[518px] p-32 max-w-[450px] rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass mx-auto md:backdrop-blur-none md:shadow-shape md:bg-fuchsia-200 overflow-y-auto ' +
          styles.invisibleScrollbar
        }
      >
        <h1 className="mb-16">{titles[step]}</h1>
        <Form
          method="post"
          methods={methods}
          submitHandler={submitHandler}
          className="grow"
        >
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
      </div>
    </main>
  )
}
