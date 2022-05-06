import Image from 'next/image'
import { useState } from 'react'
import { ChangeHandler, useFormContext } from 'react-hook-form'
import PlusCircle from '../public/static/images/plus-circle.svg'
import { IImage } from '../types/common'
import isImageValid from '../utils/functions/isImageValid'
import readAsDataUrl from '../utils/functions/readAsDataUrl'

import InputError from './InputError'
import MainButton from './MainButton'

interface CreateAPostStep2Props {
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
  setImages: React.Dispatch<React.SetStateAction<IImage[] | undefined>>
}

const CreateAPostStep2 = ({ setStep, setImages }: CreateAPostStep2Props) => {
  const [imageDataUrls, setImageDataUrls] = useState<string[]>()
  const { register, setError } = useFormContext()

  const onChange: ChangeHandler = async (e) => {
    const files = e.target.files

    if (!files || files.length === 0 || files.length > 5) {
      return setImageDataUrls(undefined)
    }

    const dataUrls: string[] = []
    const images: IImage[] = []

    for (const file of files) {
      const message = isImageValid(file)

      if (message) {
        return setError('images', { message }, { shouldFocus: true })
      }

      const result = await readAsDataUrl<IImage['ext']>(file)

      if (typeof result === 'string') {
        return setError('images', { message: result }, { shouldFocus: true })
      }

      dataUrls.push(`data:${file.type};base64,${result.base64}`)
      images.push(result)
    }

    setImageDataUrls(dataUrls)
    setImages(images)
  }

  return (
    <>
      <div className="flex flex-col flex-nowrap mb-16">
        <label
          tabIndex={0}
          htmlFor="images"
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              document.querySelector<HTMLInputElement>('#images')?.click()
          }}
          aria-label="Images"
          className="grid grid-cols-[1fr_1fr] grid-rows-[1fr_1fr_1fr] gap-8 cursor-pointer md:grid-cols-[1fr_1fr_1fr] md:grid-rows-[1fr_1fr]"
        >
          {[0, 1, 2, 3, 4].map((i) => {
            if (imageDataUrls && imageDataUrls[i]) {
              return (
                <div key={i} className="relative">
                  <Image
                    src={imageDataUrls[i]}
                    alt=""
                    layout="fill"
                    objectFit="cover"
                    className="rounded-8"
                  />
                </div>
              )
            }
            return (
              <div
                key={i}
                className="bg-fuchsia-200 text-fuchsia-900 font-bold rounded-8 aspect-square flex flex-col flex-nowrap justify-center items-center md:bg-fuchsia-100"
              >
                <PlusCircle className="w-24 h-24 mb-4" />
                Photo n°{i + 1}
              </div>
            )
          })}
        </label>
        <input
          type="file"
          multiple
          {...register('images', { onChange })}
          id="images"
          className="hidden"
        />
        <InputError inputName="images" />
      </div>
      <div className="flex">
        <MainButton
          type="button"
          onClick={() => setStep(0)}
          className="w-1/2 mr-16 md:bg-fuchsia-300"
          bgColor={{
            base: 'bg-fuchsia-200',
            states: 'hover:bg-fuchsia-400',
          }}
          textColor={{ base: 'text-fuchsia-900', states: false }}
        >
          ← Back
        </MainButton>
        <MainButton
          type="button"
          onClick={() => setStep(2)}
          className="w-1/2 disabled:bg-fuchsia-800/70 disabled:text-fuchsia-50/80"
          bgColor={{ states: 'hover:bg-fuchsia-400' }}
          disabled={!imageDataUrls || imageDataUrls.length === 0}
        >
          Next →
        </MainButton>
      </div>
    </>
  )
}

export default CreateAPostStep2
