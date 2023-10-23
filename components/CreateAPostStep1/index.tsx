import Image from 'next/image'
import { useState } from 'react'
import type { ChangeHandler } from 'react-hook-form'
import PlusCircle from 'public/static/images/plus-circle.svg'
import isImage from 'functions/isImage'
import Button from 'components/Button'
import { MAX_IMAGE_SIZE } from 'constants/index'
import {
  IMAGES_REQUIRED,
  IMAGES_MAX,
  IMAGE_INVALID,
  IMAGE_TOO_BIG,
} from 'constants/errors'

interface CreateAPostStep1Props {
  step: 0 | 1 | 2
  setStep: React.Dispatch<React.SetStateAction<0 | 1 | 2>>
  setImages: React.Dispatch<React.SetStateAction<File[]>>
}

export default function CreateAPostStep1({
  step,
  setStep,
  setImages,
}: CreateAPostStep1Props) {
  const [imageSources, setImageSources] = useState<string[]>()
  const [error, setError] = useState<string>()

  const onChange: ChangeHandler = async (e: Parameters<ChangeHandler>[0]) => {
    const files: File[] = Array.from(e.target.files)

    if (files.length === 0) {
      setError(IMAGES_REQUIRED)
      return setImageSources(undefined)
    } else if (files.length > 5) {
      setError(IMAGES_MAX)
      return setImageSources(undefined)
    }

    const imageSources: string[] = []
    const images: File[] = []

    for (const file of files) {
      if (!isImage(file)) {
        setError(IMAGE_INVALID)
        return setImageSources(undefined)
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(IMAGE_TOO_BIG)
        return setImageSources(undefined)
      }

      const addImageSource = async () => {
        return new Promise((resolve) => {
          const reader = new FileReader()

          reader.onload = (e) => {
            const result = e.target?.result as string
            imageSources.push(result)
            resolve(null)
          }

          reader.readAsDataURL(file)
        })
      }

      await addImageSource()

      images.push(file)
    }

    setImageSources(imageSources)
    setError(undefined)
    setImages(images)
  }

  return (
    <div
      data-testid="step1"
      className={step === 1 ? 'h-full flex flex-col' : 'hidden'}
    >
      <label
        tabIndex={0}
        htmlFor="images"
        onKeyDown={(e) => {
          if (e.key === 'Enter')
            document.querySelector<HTMLInputElement>('#images')?.click()
        }}
        aria-label="Images"
        className="grow flex flex-row flex-wrap gap-8 cursor-pointer"
      >
        {[0, 1, 2, 3, 4].map((i) => {
          if (imageSources && imageSources[i]) {
            return (
              <div
                key={i}
                className="relative w-[calc(50%-4px)] h-[calc((100%/3)-(16px/3))]"
              >
                <Image
                  src={imageSources[i]}
                  alt=""
                  fill
                  className="rounded-8 object-cover"
                />
              </div>
            )
          }
          return (
            <div
              key={i}
              className="w-[calc(50%-4px)] h-[calc((100%/3)-(16px/3))] bg-fuchsia-200 text-fuchsia-900 font-bold rounded-8 flex flex-col justify-center items-center md:bg-fuchsia-100"
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
        name="images"
        onChange={onChange}
        id="images"
        className="hidden"
      />
      {error && (
        <div role="alert" className="font-bold text-rose-600 break-words">
          {error}
        </div>
      )}
      <div className="flex gap-x-16 mt-16">
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
          disabled={!imageSources || imageSources.length === 0}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}
