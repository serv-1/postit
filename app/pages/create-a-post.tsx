'use client'

import Head from 'next/head'
import Header from 'components/Header'
import { useState } from 'react'
import CreateAPostStep0 from 'components/CreateAPostStep0'
import CreateAPostStep1 from 'components/CreateAPostStep1'
import CreateAPostStep2 from 'components/CreateAPostStep2'
import GlassWrapper from 'components/GlassWrapper'
import ShapeContainer from 'components/ShapeContainer'
import Form from 'components/Form'
import { useToast } from 'contexts/toast'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import addPostSchema, { AddPostSchema } from 'schemas/addPostSchema'
import { joiResolver } from '@hookform/resolvers/joi'
import axios from 'axios'
import getAxiosError from 'utils/functions/getAxiosError'
import err from 'utils/constants/errors'
import useLinearBackgroundGradient from 'hooks/useLinearBackgroundGradient'

interface Response {
  url: string
  key: string
  fields: Record<string, string>
}

export default function Page({ csrfToken }: { csrfToken?: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [images, setImages] = useState<File[]>([])
  const [latLon, setLatLon] = useState<[number, number]>()

  useLinearBackgroundGradient()

  const titles = ['Where is it?', 'Show us what it is', 'Post!']

  const { setToast } = useToast()
  const router = useRouter()

  const methods = useForm<AddPostSchema>({
    resolver: joiResolver(addPostSchema),
  })

  const submitHandler: SubmitHandler<AddPostSchema> = async (data) => {
    try {
      const keys: string[] = []

      for (const image of images) {
        const res = await axios.get<Response>('/api/s3?csrfToken=' + csrfToken)
        const { url, fields, key } = res.data

        const formData = new FormData()
        Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
        formData.append('file', image)
        await axios.post(url, formData)

        keys.push(key)
      }

      const _data = { ...data, images: keys, latLon }
      const res = await axios.post('/api/post', _data)

      router.push(res.headers['location'])
    } catch (e) {
      const { name, message, status } = getAxiosError<keyof AddPostSchema>(e)

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
    <>
      <Head>
        <title>Create a post - PostIt</title>
      </Head>
      <main className="flex flex-col justify-center items-center row-span-2">
        <Header />
        <GlassWrapper
          minHeight="min-h-[553.89px] md:min-h-[598px]"
          padding="p-32"
        >
          <ShapeContainer>
            <h1 className="mb-16">{titles[step]}</h1>
            <Form
              method="post"
              methods={methods}
              submitHandler={submitHandler}
              csrfToken={csrfToken}
              className="h-full"
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
          </ShapeContainer>
        </GlassWrapper>
      </main>
    </>
  )
}

Page.needAuth = true
