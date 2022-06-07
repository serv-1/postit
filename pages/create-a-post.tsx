import { IImage } from '../types/common'
import Head from 'next/head'
import Header from '../components/Header'
import HeaderDropdownMenu from '../components/HeaderDropdownMenu'
import { useState } from 'react'
import { GetServerSideProps } from 'next'
import CreateAPostStep0 from '../components/CreateAPostStep0'
import CreateAPostStep1 from '../components/CreateAPostStep1'
import CreateAPostStep2 from '../components/CreateAPostStep2'
import GlassWrapper from '../components/GlassWrapper'
import ShapeContainer from '../components/ShapeContainer'
import { getCsrfToken } from 'next-auth/react'

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: { background: 'bg-linear-page', csrfToken: await getCsrfToken(ctx) },
})

interface CreateAPostProps {
  csrfToken?: string
}

const CreateAPost = ({ csrfToken }: CreateAPostProps) => {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [images, setImages] = useState<IImage[]>()
  const [location, setLocation] = useState<string>()

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
            <CreateAPostStep0
              step={step}
              setStep={setStep}
              location={location}
              setLocation={setLocation}
            />
            <CreateAPostStep1
              step={step}
              setStep={setStep}
              setImages={setImages}
            />
            <CreateAPostStep2
              step={step}
              setStep={setStep}
              images={images}
              location={location}
              csrfToken={csrfToken}
            />
          </ShapeContainer>
        </GlassWrapper>
      </div>
    </>
  )
}

CreateAPost.needAuth = true
CreateAPost.need2RowsGrid = true

export default CreateAPost
