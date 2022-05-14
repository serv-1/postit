import Image from 'next/image'
import { useState } from 'react'
import { ChangeHandler, useFormContext } from 'react-hook-form'
import PlusCircle from '../public/static/images/plus-circle.svg'
import { IImage } from '../types/common'
import isImageValid from '../utils/functions/isImageValid'
import readAsDataUrl from '../utils/functions/readAsDataUrl'
import Button from './Button'

import InputError from './InputError'

interface CreateAPostStep1Props {
  step: React.SetStateAction<0 | 1 | 2>
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
  setImages: React.Dispatch<React.SetStateAction<IImage[] | undefined>>
}

const CreateAPostStep1 = (props: CreateAPostStep1Props) => {
  const { step, setStep, setImages } = props
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
    <div
      data-testid="step1"
      className={
        step === 1 ? 'h-full flex flex-col gap-y-16 justify-between' : 'hidden'
      }
    >
      <div className="flex flex-col flex-nowrap">
        <label
          tabIndex={0}
          htmlFor="images"
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              document.querySelector<HTMLInputElement>('#images')?.click()
          }}
          aria-label="Images"
          className="flex flex-row flex-wrap gap-8 justify-center"
        >
          {[0, 1, 2, 3, 4].map((i) => {
            if (imageDataUrls && imageDataUrls[i]) {
              return (
                <div key={i} className="relative w-[123.3px] aspect-square">
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
                className="w-[123.3px] bg-fuchsia-200 text-fuchsia-900 font-bold rounded-8 aspect-square flex flex-col flex-nowrap justify-center items-center md:bg-fuchsia-100"
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
      <div className="flex gap-x-16">
        <Button
          color="secondary"
          fullWidth
          onClick={() => setStep(0)}
          type="button"
        >
          ← Back
        </Button>
        <Button
          color="primary"
          fullWidth
          onClick={() => setStep(2)}
          type="button"
          disabled={!imageDataUrls || imageDataUrls.length === 0}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

export default CreateAPostStep1
