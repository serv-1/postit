import { joiResolver } from '@hookform/resolvers/joi'
import axios, { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import Form from '../components/Form'
import { useToast } from '../contexts/toast'
import {
  createPostClientSchema,
  CreatePostClientSchema,
} from '../lib/joi/createPostSchema'
import getAxiosError from '../utils/functions/getAxiosError'
import { useRouter } from 'next/router'
import { IImage } from '../types/common'
import Head from 'next/head'
import Header from '../components/Header'
import HeaderDropdownMenu from '../components/HeaderDropdownMenu'
import { useState } from 'react'
import { GetStaticProps } from 'next'
import CreateAPostStep1 from '../components/CreateAPostStep1'
import CreateAPostStep2 from '../components/CreateAPostStep2'
import CreateAPostStep3 from '../components/CreateAPostStep3'

export const getStaticProps: GetStaticProps = () => ({
  props: { background: 'bg-linear-page' },
})

const CreateAPost = () => {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [images, setImages] = useState<IImage[]>()
  const resolver = joiResolver(createPostClientSchema)
  const methods = useForm<CreatePostClientSchema>({ resolver })
  const { setToast } = useToast()
  const router = useRouter()

  const submitHandler: SubmitHandler<CreatePostClientSchema> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/post', { ...data, images })
      router.push('/profile')
    } catch (e) {
      type FieldsNames = keyof CreatePostClientSchema
      const { name, message } = getAxiosError<FieldsNames>(e as AxiosError)

      if (name) {
        return methods.setError(name, { message }, { shouldFocus: true })
      }

      setToast({ message, error: true })
    }
  }

  const visibleClasses = 'h-full flex flex-col flex-nowrap justify-between'
  const titles = ['Where is it?', 'Show us what it is', 'Post!']

  return (
    <>
      <Head>
        <title>Create a post - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header className="w-[328px] py-4 pb-8 md:w-full">
          <HeaderDropdownMenu />
        </Header>
        <main className="md:w-full md:bg-linear-wrapper md:rounded-16 md:py-32">
          <div className="w-[328px] h-[604px] p-32 rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass flex flex-col flex-nowrap md:shadow-shape md:bg-fuchsia-200 md:w-[450px] md:h-[620px] md:mx-auto">
            <h1 className="mb-16">{titles[step]}</h1>
            <Form
              name="createPost"
              method="post"
              methods={methods}
              submitHandler={submitHandler}
              needCsrfToken
              className="h-full"
            >
              <div
                data-testid="step0"
                className={step === 0 ? visibleClasses : 'hidden'}
              >
                <CreateAPostStep1 setStep={setStep} />
              </div>
              <div
                data-testid="step1"
                className={step === 1 ? visibleClasses : 'hidden'}
              >
                <CreateAPostStep2 setStep={setStep} setImages={setImages} />
              </div>
              <div
                data-testid="step2"
                className={step === 2 ? visibleClasses : 'hidden'}
              >
                <CreateAPostStep3 setStep={setStep} />
              </div>
            </Form>
          </div>
        </main>
      </div>
    </>
  )
}

CreateAPost.needAuth = true
CreateAPost.need2RowsGrid = true

export default CreateAPost
