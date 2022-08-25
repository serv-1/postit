import { IImage } from '../types/common'
import Head from 'next/head'
import Header from '../components/Header'
import { useState } from 'react'
import { GetServerSideProps } from 'next'
import CreateAPostStep0 from '../components/CreateAPostStep0'
import CreateAPostStep1 from '../components/CreateAPostStep1'
import CreateAPostStep2 from '../components/CreateAPostStep2'
import GlassWrapper from '../components/GlassWrapper'
import ShapeContainer from '../components/ShapeContainer'
import { getCsrfToken } from 'next-auth/react'
import Form from '../components/Form'
import { useToast } from '../contexts/toast'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import addPostSchema, { AddPostSchema } from '../schemas/addPostSchema'
import { joiResolver } from '@hookform/resolvers/joi'
import axios from 'axios'
import getAxiosError from '../utils/functions/getAxiosError'

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: { background: 'bg-linear-page', csrfToken: await getCsrfToken(ctx) },
})

interface CreateAPostProps {
  csrfToken?: string
}

const CreateAPost = ({ csrfToken }: CreateAPostProps) => {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [images, setImages] = useState<IImage[]>()
  const [latLon, setLatLon] = useState<[number, number]>()

  const titles = ['Where is it?', 'Show us what it is', 'Post!']

  const { setToast } = useToast()
  const router = useRouter()

  const methods = useForm<AddPostSchema>({
    resolver: joiResolver(addPostSchema),
  })

  const submitHandler: SubmitHandler<AddPostSchema> = async (data) => {
    try {
      const _data = { ...data, images, latLon }
      const res = await axios.post('http://localhost:3000/api/post', _data)
      router.push(res.headers['location'])
    } catch (e) {
      const { name, message } = getAxiosError<keyof AddPostSchema>(e)

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
      <div className="flex flex-col flex-nowrap justify-center items-center">
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
      </div>
    </>
  )
}

CreateAPost.needAuth = true
CreateAPost.need2RowsGrid = true

export default CreateAPost
