import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import Form from '../components/Form'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import { useRouter } from 'next/router'
import { IImage } from '../types/common'
import Head from 'next/head'
import Header from '../components/Header'
import HeaderDropdownMenu from '../components/HeaderDropdownMenu'
import { useState } from 'react'
import { GetStaticProps } from 'next'
import CreateAPostStep0 from '../components/CreateAPostStep0'
import CreateAPostStep1 from '../components/CreateAPostStep1'
import CreateAPostStep2 from '../components/CreateAPostStep2'
import GlassWrapper from '../components/GlassWrapper'
import ShapeContainer from '../components/ShapeContainer'
import addPostSchema, { AddPostSchema } from '../schemas/addPostSchema'

export const getStaticProps: GetStaticProps = () => ({
  props: { background: 'bg-linear-page' },
})

const CreateAPost = () => {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [images, setImages] = useState<IImage[]>()
  const resolver = joiResolver(addPostSchema)
  const methods = useForm<AddPostSchema>({ resolver })
  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<AddPostSchema> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/post', { ...data, images })
      router.push('/profile')
    } catch (e) {
      type FieldsNames = keyof AddPostSchema
      const { name, message } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  const titles = ['Where is it?', 'Show us what it is', 'Post!']

  return (
    <>
      <Head>
        <title>Create a post - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header className="w-full max-w-[450px] py-4 pb-8 md:max-w-full">
          <HeaderDropdownMenu />
        </Header>
        <GlassWrapper
          minHeight="min-h-[553.89px] md:min-h-[598px]"
          padding="p-32"
        >
          <ShapeContainer>
            <h1 className="mb-16">{titles[step]}</h1>
            <Form
              name="createPost"
              method="post"
              methods={methods}
              submitHandler={submitHandler}
              needCsrfToken
              className="h-full"
            >
              <CreateAPostStep0 step={step} setStep={setStep} />
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
